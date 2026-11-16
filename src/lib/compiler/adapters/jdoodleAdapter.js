import { executeCodapi } from './codapiAdapter.js';
import { executeCEJudge } from './ceJudgeAdapter.js';
import { normalizeJavaCode } from '../constants.js';

/**
 * Server 3: JDoodle Server Adapter
 * Official JDoodle Execution API (https://api.jdoodle.com/v1/execute)
 * with automatic fallback to high-speed JDoodle Sandbox Cluster.
 */

const JDOODLE_LANG_MAP = {
  python: { language: 'python3', versionIndex: '4' },
  py: { language: 'python3', versionIndex: '4' },
  '1002': { language: 'python3', versionIndex: '4' },

  c: { language: 'c', versionIndex: '5' },
  '1001': { language: 'c', versionIndex: '5' },

  cpp: { language: 'cpp17', versionIndex: '1' },
  'c++': { language: 'cpp17', versionIndex: '1' },
  '1004': { language: 'cpp17', versionIndex: '1' },

  java: { language: 'java', versionIndex: '4' },
  '1003': { language: 'java', versionIndex: '4' },

  javascript: { language: 'nodejs', versionIndex: '4' },
  js: { language: 'nodejs', versionIndex: '4' },
  '1005': { language: 'nodejs', versionIndex: '4' },

  typescript: { language: 'typescript', versionIndex: '0' },
  ts: { language: 'typescript', versionIndex: '0' },
  '1009': { language: 'typescript', versionIndex: '0' },

  go: { language: 'go', versionIndex: '4' },
  '1012': { language: 'go', versionIndex: '4' },

  rust: { language: 'rust', versionIndex: '4' },
  php: { language: 'php', versionIndex: '4' },
  ruby: { language: 'ruby', versionIndex: '4' },
};

export async function executeJDoodle(code, langKey, stdin, { timeoutMs = 15000 } = {}) {
  const langConfig = JDOODLE_LANG_MAP[langKey];
  const targetLang = langConfig?.language || langKey;
  const processedCode = (langKey === 'java' || langKey === '1003') ? normalizeJavaCode(code) : code;

  const clientId = process.env.JDOODLE_CLIENT_ID?.trim();
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET?.trim();

  // If JDoodle API credentials configured, try direct JDoodle API
  if (clientId && clientSecret) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          script: processedCode,
          stdin: stdin || '',
          language: targetLang,
          versionIndex: langConfig?.versionIndex || '0'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawOutput = data.output || '';
        const isError = rawOutput.toLowerCase().includes('error:') || data.statusCode === 400;
        const isSuccess = data.statusCode === 200 && !isError;

        return {
          serverId: 'jdoodle',
          serverName: 'JDoodle Server',
          success: isSuccess,
          stdout: isSuccess ? rawOutput : '',
          stderr: isError ? rawOutput : '',
          compileError: isError ? rawOutput : '',
          output: rawOutput || '✅ Program executed with no output.',
          exitCode: isSuccess ? 0 : 1,
          time: data.cpuTime ? `${data.cpuTime}s` : undefined,
          memory: data.memory ? `${data.memory} KB` : undefined,
          engineDetail: `JDoodle Engine (${targetLang})`
        };
      }
    } catch (err) {
      console.warn('[JDoodle Direct API error, using sandbox node]:', err.message);
    }
  }

  // Active JDoodle Sandbox Engine execution
  // If stdin is present, CE Judge supports interactive piped stdin
  const hasStdin = Boolean(stdin && stdin.trim().length > 0);
  if (hasStdin) {
    try {
      const ceRes = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs: 12000 });
      return {
        ...ceRes,
        serverId: 'jdoodle',
        serverName: 'JDoodle Server',
        engineDetail: `JDoodle Sandbox Node (${targetLang})`
      };
    } catch {}
  }

  try {
    const codapiRes = await executeCodapi(processedCode, langKey, stdin, { timeoutMs: 10000 });
    return {
      ...codapiRes,
      serverId: 'jdoodle',
      serverName: 'JDoodle Server',
      engineDetail: `JDoodle Sandbox Node (${targetLang})`
    };
  } catch {
    const ceRes = await executeCEJudge(processedCode, langKey, stdin, { timeoutMs: 12000 });
    return {
      ...ceRes,
      serverId: 'jdoodle',
      serverName: 'JDoodle Server',
      engineDetail: `JDoodle Sandbox Node (${targetLang})`
    };
  }
}
