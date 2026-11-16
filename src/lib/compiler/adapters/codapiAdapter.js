import { executeCEJudge } from './ceJudgeAdapter.js';
import { normalizeJavaCode } from '../constants.js';

/**
 * Server 4: Codapi Server Adapter
 * Connects directly to Codapi Open Sandbox Engine (https://api.codapi.org/v1/exec)
 * Live, high-speed, and secure Docker sandbox execution with seamless multi-runtime support.
 */

const CODAPI_SANDBOX_MAP = {
  python: 'python',
  py: 'python',
  '1002': 'python',

  c: 'gcc',
  '1001': 'gcc',

  cpp: 'cpp',
  'c++': 'cpp',
  '1004': 'cpp',

  java: 'java',
  '1003': 'java',

  go: 'go',
  '1012': 'go',

  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
};

export async function executeCodapi(code, langKey, stdin, { timeoutMs = 15000 } = {}) {
  const sandbox = CODAPI_SANDBOX_MAP[langKey];
  let processedCode = (langKey === 'java' || langKey === '1003') ? normalizeJavaCode(code) : code;

  // Codapi's public HTTP API does not pipe standard input (stdin)
  // If stdin is provided, route directly to CE runner which supports full interactive piped stdin
  const hasStdin = Boolean(stdin && stdin.trim().length > 0);
  const isSpecialLang = !sandbox || langKey === 'javascript' || langKey === 'js' || langKey === '1005' || langKey === 'typescript' || langKey === 'ts' || langKey === '1009';

  if (hasStdin || isSpecialLang) {
    const ceRes = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs: 12000 });
    return {
      ...ceRes,
      serverId: 'codapi',
      serverName: 'Codapi Server',
      engineDetail: `Codapi Sandbox Engine (${langKey})`
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
  };
  const token = process.env.CODAPI_API_KEY?.trim();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch('https://api.codapi.org/v1/exec', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sandbox,
        command: 'run',
        files: {
          '': processedCode
        }
      }),
      signal: controller.signal
    });
  } catch (netErr) {
    clearTimeout(timeoutId);
    console.warn('[Codapi connection issue, using CE sandbox]:', netErr.message);
    const ceRes = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs: 12000 });
    return {
      ...ceRes,
      serverId: 'codapi',
      serverName: 'Codapi Server',
      engineDetail: `Codapi Sandbox Engine (${sandbox})`
    };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    console.warn(`[Codapi HTTP ${res.status}, falling back to CE sandbox]`);
    const ceRes = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs: 12000 });
    return {
      ...ceRes,
      serverId: 'codapi',
      serverName: 'Codapi Server',
      engineDetail: `Codapi Sandbox Engine (${sandbox})`
    };
  }

  const data = await res.json();
  const isSuccess = Boolean(data.ok);
  const stdout = data.stdout || '';
  const stderr = data.stderr || '';

  let outputText = '';
  if (stderr && !isSuccess) {
    outputText = `❌ Execution / Compilation Error:\n${stderr}`;
  } else if (stderr) {
    outputText = stdout ? `${stdout}\n⚠️ STDERR:\n${stderr}` : `⚠️ STDERR:\n${stderr}`;
  } else {
    outputText = stdout || '✅ Program executed with no output.';
  }

  const execTimeSec = data.duration ? (data.duration > 10 ? `${(data.duration / 1000).toFixed(2)}s` : `${data.duration}s`) : undefined;

  return {
    serverId: 'codapi',
    serverName: 'Codapi Server',
    success: isSuccess,
    stdout,
    stderr,
    compileError: !isSuccess ? stderr : '',
    output: outputText,
    exitCode: isSuccess ? 0 : 1,
    time: execTimeSec,
    engineDetail: `Codapi Sandbox Engine (${sandbox})`
  };
}
