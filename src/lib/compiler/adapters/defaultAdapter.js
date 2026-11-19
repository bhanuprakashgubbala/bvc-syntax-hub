import { executeCEJudge } from './ceJudgeAdapter.js';
import { executeCodapi } from './codapiAdapter.js';
import { executeLocalCode, isLocalExecutionSupported } from '../localRunner.js';
import { normalizeJavaCode } from '../constants.js';

/**
 * Server 1: Default Server Adapter
 * Optimized multi-runtime execution engine:
 * - Native Sandboxed Execution for Python & JS (~30ms)
 * - Judge0 CE / Codapi Sandboxed Runners for C, C++, Java, Go, Rust
 */
export async function executeDefaultServer(code, langKey, stdin, { timeoutMs = 12000 } = {}) {
  let processedCode = code;
  if (langKey === 'java' || langKey === '1003') {
    processedCode = normalizeJavaCode(processedCode);
  }

  // 1. Ultra-fast Native Sandbox execution for supported local runtimes (Python, Node.js)
  if (isLocalExecutionSupported(langKey)) {
    try {
      const localRes = await executeLocalCode(processedCode, langKey, stdin, { timeoutMs: Math.min(timeoutMs, 6000) });
      return {
        ...localRes,
        serverId: 'default',
        serverName: 'Default Server',
        engineDetail: 'Default Server (Ultra-Fast Native Sandbox)'
      };
    } catch (localErr) {
      console.warn('[Default Server local execution fallback]:', localErr.message);
    }
  }

  // 2. Primary cloud execution via high-speed Judge0 CE cluster
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

  // 3. High-speed backup via Codapi
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
