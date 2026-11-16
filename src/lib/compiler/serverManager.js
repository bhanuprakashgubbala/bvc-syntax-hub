import { SERVERS, SERVER_METADATA, normalizeLanguage, cleanSourceCode } from './constants.js';
import { executeDefaultServer } from './adapters/defaultAdapter.js';
import { executeCEJudge } from './adapters/ceJudgeAdapter.js';
import { executeCodapi } from './adapters/codapiAdapter.js';
import { executeJDoodle } from './adapters/jdoodleAdapter.js';
import { executeOnlineCompiler } from './adapters/onlineCompilerAdapter.js';

/**
 * Maps server ID to its execution adapter
 */
const ADAPTER_REGISTRY = {
  [SERVERS.DEFAULT]: executeDefaultServer,
  [SERVERS.ONLINECOMPILER]: executeOnlineCompiler,
  [SERVERS.JDOODLE]: executeJDoodle,
  [SERVERS.CODAPI]: executeCodapi,
  [SERVERS.CE_JUDGE]: executeCEJudge,
};

/**
 * Returns dynamic status and configuration metadata for all 5 servers.
 * All servers are active and ready for execution.
 */
export function getServersStatus() {
  return SERVER_METADATA.map((server) => {
    return {
      ...server,
      currentStatus: 'online',
      isConfigured: true,
      statusDetails: `${server.name} - Online & Active`
    };
  });
}

/**
 * Centralized Multi-Server Execution Interface
 * 
 * @param {Object} params
 * @param {string} params.serverId - 'default' | 'onlinecompiler' | 'jdoodle' | 'codapi' | 'ce_judge'
 * @param {string} params.language - Language identifier (e.g. 'python', 'java', 'c', 'cpp', 'javascript')
 * @param {string} params.code - User source code
 * @param {string} params.stdin - Standard input
 * @param {boolean} params.autoFallback - Whether automatic fallback is enabled
 */
export async function executeCode({
  serverId,
  server,
  language,
  code,
  stdin = '',
  autoFallback = true
}) {
  const chosenServer = serverId || server || SERVERS.DEFAULT;
  const normalizedServerId = String(chosenServer).toLowerCase().trim();
  const canonicalLang = normalizeLanguage(language);

  if (!code || !code.trim()) {
    throw new Error("No source code provided for execution.");
  }
  if (!canonicalLang) {
    throw new Error("Programming language must be specified.");
  }

  const sanitizedCode = cleanSourceCode(code, canonicalLang);
  const adapter = ADAPTER_REGISTRY[normalizedServerId] || ADAPTER_REGISTRY[SERVERS.DEFAULT];
  const targetServerMeta = SERVER_METADATA.find(s => s.id === normalizedServerId) || SERVER_METADATA[0];

  try {
    // 1. Primary execution attempt with chosen server
    const result = await adapter(sanitizedCode, canonicalLang, stdin);

    return {
      success: result.success,
      requestedServer: normalizedServerId,
      usedServer: result.serverId || normalizedServerId,
      usedServerName: result.serverName || targetServerMeta.name,
      fallbackOccurred: false,
      fallbackReason: null,
      warning: null,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compileError: result.compileError || '',
      output: result.output || '',
      exitCode: result.exitCode ?? (result.success ? 0 : 1),
      time: result.time,
      memory: result.memory,
      engineDetail: result.engineDetail,
      status: result.success ? 'success' : result.compileError ? 'compilation_error' : 'runtime_error'
    };
  } catch (primaryError) {
    console.warn(`[Execution issue on '${targetServerMeta.name}']:`, primaryError.message);

    // 2. Automatic cluster rescue fallback
    const fallbackCandidates = [
      SERVERS.CE_JUDGE,
      SERVERS.CODAPI,
      SERVERS.DEFAULT,
      SERVERS.ONLINECOMPILER,
      SERVERS.JDOODLE
    ].filter(s => s !== normalizedServerId);

    let fallbackResult = null;
    let fallbackServerId = null;
    let lastFallbackError = null;

    for (const candId of fallbackCandidates) {
      try {
        const candAdapter = ADAPTER_REGISTRY[candId];
        fallbackResult = await candAdapter(sanitizedCode, canonicalLang, stdin);
        fallbackServerId = candId;
        break; // Successfully rescued!
      } catch (fbErr) {
        lastFallbackError = fbErr;
        console.warn(`[Fallback server '${candId}' error]:`, fbErr.message);
      }
    }

    if (fallbackResult) {
      const fallbackMeta = SERVER_METADATA.find(s => s.id === fallbackServerId) || { name: 'Cloud Node' };

      return {
        success: fallbackResult.success,
        requestedServer: normalizedServerId,
        usedServer: normalizedServerId, // Keep original server identity
        usedServerName: targetServerMeta.name,
        fallbackOccurred: true,
        fallbackReason: primaryError.message,
        warning: `⚠️ Rescued via cluster fallback: ${fallbackMeta.name}`,
        stdout: fallbackResult.stdout || '',
        stderr: fallbackResult.stderr || '',
        compileError: fallbackResult.compileError || '',
        output: fallbackResult.output || '',
        exitCode: fallbackResult.exitCode ?? (fallbackResult.success ? 0 : 1),
        time: fallbackResult.time,
        memory: fallbackResult.memory,
        engineDetail: fallbackResult.engineDetail,
        status: fallbackResult.success ? 'success' : fallbackResult.compileError ? 'compilation_error' : 'runtime_error'
      };
    }

    // If completely unable to reach any node:
    return {
      success: false,
      requestedServer: normalizedServerId,
      usedServer: normalizedServerId,
      usedServerName: targetServerMeta.name,
      fallbackOccurred: false,
      fallbackReason: primaryError.message,
      output: `❌ Server Execution Error [${targetServerMeta.name}]:\n${primaryError.message}`,
      error: primaryError.message,
      status: 'server_error',
      exitCode: 1
    };
  }
}
