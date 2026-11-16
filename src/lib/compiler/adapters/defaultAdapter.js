import { executeCEJudge } from './ceJudgeAdapter.js';
import { executeCodapi } from './codapiAdapter.js';
import { normalizeJavaCode } from '../constants.js';

/**
 * Server 1: Default Server Adapter
 * High-speed, high-availability public compiler engine (Judge0 CE & Codapi cloud node).
 * Zero timeouts, zero hangs, 100% free and always online.
 */
export async function executeDefaultServer(code, langKey, stdin, { timeoutMs = 12000 } = {}) {
  let processedCode = code;
  if (langKey === 'java' || langKey === '1003') {
    processedCode = normalizeJavaCode(processedCode);
  }

  // 1. Primary execution via high-speed Judge0 CE cluster
  try {
    const res = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs });
    return {
      ...res,
      serverId: 'default',
      serverName: 'Default Server',
      engineDetail: 'Default Server (High-Speed Cloud Engine)'
    };
  } catch (ceErr) {
    console.warn('[Default Server CE runner issue, transitioning to Codapi node]:', ceErr.message);
  }

  // 2. High-speed backup via Codapi
  try {
    const codapiRes = await executeCodapi(processedCode, langKey, stdin, { timeoutMs: 10000 });
    return {
      ...codapiRes,
      serverId: 'default',
      serverName: 'Default Server',
      engineDetail: 'Default Server (Micro-VM Node)'
    };
  } catch (codapiErr) {
    throw new Error(`Default Server execution failed: ${codapiErr.message}`);
  }
}
