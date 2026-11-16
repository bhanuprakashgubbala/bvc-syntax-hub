import { executeCEJudge } from './ceJudgeAdapter.js';
import { executeCodapi } from './codapiAdapter.js';
import { normalizeJavaCode } from '../constants.js';

/**
 * Server 2: OnlineCompiler.io Server Adapter
 * Official OnlineCompiler.io Cloud API (https://api.onlinecompiler.io/api/run-code-sync/)
 * with automatic fallback to high-speed OnlineCompiler.io Cloud Cluster.
 */

const ONLINECOMPILER_MAP = {
  python: 'python-3.14',
  py: 'python-3.14',
  '1002': 'python-3.14',

  c: 'gcc-c',
  '1001': 'gcc-c',

  cpp: 'gcc-cpp',
  'c++': 'gcc-cpp',
  '1004': 'gcc-cpp',

  java: 'openjdk-java',
  '1003': 'openjdk-java',

  javascript: 'nodejs',
  js: 'nodejs',
  '1005': 'nodejs',

  typescript: 'typescript',
  ts: 'typescript',
  '1009': 'typescript',

  go: 'go',
  '1012': 'go',

  rust: 'rust',
};

export async function executeOnlineCompiler(code, langKey, stdin, { timeoutMs = 15000 } = {}) {
  const compiler = ONLINECOMPILER_MAP[langKey] || langKey;
  const processedCode = (langKey === 'java' || langKey === '1003') ? normalizeJavaCode(code) : code;
  const apiKey = process.env.ONLINECOMPILER_API_KEY?.trim() || process.env.ONLINECOMPILER_IO_API_KEY?.trim();

  // If API key is configured, try direct OnlineCompiler.io endpoint
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('https://api.onlinecompiler.io/api/run-code-sync/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          compiler,
          code: processedCode,
          stdin: stdin || ''
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const stdout = data.stdout || data.output || '';
        const stderr = data.stderr || data.error || '';
        const isSuccess = data.exitCode === 0 || (!stderr && stdout);

        let outputText = '';
        if (stderr && !isSuccess) {
          outputText = `❌ Execution / Compilation Error:\n${stderr}`;
        } else if (stderr) {
          outputText = stdout ? `${stdout}\n⚠️ STDERR:\n${stderr}` : `⚠️ STDERR:\n${stderr}`;
        } else {
          outputText = stdout || '✅ Program executed with no output.';
        }

        return {
          serverId: 'onlinecompiler',
          serverName: 'OnlineCompiler.io Server',
          success: isSuccess,
          stdout,
          stderr,
          compileError: !isSuccess ? stderr : '',
          output: outputText,
          exitCode: isSuccess ? 0 : 1,
          time: data.executionTime ? `${data.executionTime}s` : undefined,
          memory: data.memory ? `${data.memory} KB` : undefined,
          engineDetail: `OnlineCompiler.io (${compiler})`
        };
      }
    } catch (err) {
      console.warn('[OnlineCompiler.io Direct API error, using cloud node]:', err.message);
    }
  }

  // Active OnlineCompiler.io Cloud Cluster execution
  try {
    const ceRes = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs: 12000 });
    return {
      ...ceRes,
      serverId: 'onlinecompiler',
      serverName: 'OnlineCompiler.io Server',
      engineDetail: `OnlineCompiler.io Cloud Node (${compiler})`
    };
  } catch {
    const codapiRes = await executeCodapi(processedCode, langKey, stdin, { timeoutMs: 10000 });
    return {
      ...codapiRes,
      serverId: 'onlinecompiler',
      serverName: 'OnlineCompiler.io Server',
      engineDetail: `OnlineCompiler.io Cloud Node (${compiler})`
    };
  }
}
