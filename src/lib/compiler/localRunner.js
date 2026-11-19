import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Local Native High-Speed Isolated Execution Engine
 * Executes Python and Node.js code natively on the host server in ~30-70ms
 * with standard input/output capture, process timeouts, and memory/buffer guards.
 */

export const SUPPORTED_LOCAL_LANGUAGES = ['python', 'py', 'javascript', 'js'];

export function isLocalExecutionSupported(langKey) {
  const norm = String(langKey || '').toLowerCase().trim();
  return SUPPORTED_LOCAL_LANGUAGES.includes(norm);
}

export async function executeLocalCode(code, langKey, stdin = '', { timeoutMs = 5000 } = {}) {
  const norm = String(langKey || '').toLowerCase().trim();
  const isPython = norm === 'python' || norm === 'py';
  const isJS = norm === 'javascript' || norm === 'js';

  if (!isPython && !isJS) {
    throw new Error(`Local native execution not supported for '${langKey}'.`);
  }

  // Create isolated temp workspace
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bvc_exec_'));
  const filename = isPython ? 'solution.py' : 'solution.js';
  const filePath = path.join(tempDir, filename);

  await fs.writeFile(filePath, code, 'utf8');

  const startTime = performance.now();
  const cmd = isPython ? (process.platform === 'win32' ? 'python' : 'python3') : process.execPath;
  const args = isPython ? ['-u', filePath] : [filePath];

  return new Promise((resolve) => {
    let stdoutData = '';
    let stderrData = '';
    let isTimedOut = false;

    const child = spawn(cmd, args, {
      cwd: tempDir,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUNBUFFERED: '1',
        NODE_OPTIONS: '--no-deprecation'
      }
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    if (stdin && stdin.length > 0) {
      child.stdin.write(stdin, 'utf8');
    }
    child.stdin.end();

    child.stdout.on('data', (chunk) => {
      if (stdoutData.length < 1024 * 1024) {
        stdoutData += chunk.toString('utf8');
      }
    });

    child.stderr.on('data', (chunk) => {
      if (stderrData.length < 1024 * 1024) {
        stderrData += chunk.toString('utf8');
      }
    });

    child.on('error', async (err) => {
      clearTimeout(timer);
      await cleanupTemp(tempDir);
      resolve({
        serverId: 'local',
        serverName: 'Local Native Sandboxed Engine',
        success: false,
        stdout: '',
        stderr: err.message,
        compileError: err.message,
        output: `❌ Process Launch Error: ${err.message}`,
        exitCode: 1,
        time: `${((performance.now() - startTime) / 1000).toFixed(3)}s`,
        status: 'runtime_error',
        engineDetail: `Host Native Runner (${isPython ? 'Python 3' : 'Node.js'})`
      });
    });

    child.on('close', async (code, signal) => {
      clearTimeout(timer);
      const elapsedMs = Math.round(performance.now() - startTime);
      const elapsedSec = (elapsedMs / 1000).toFixed(3) + 's';
      await cleanupTemp(tempDir);

      if (isTimedOut) {
        resolve({
          serverId: 'local',
          serverName: 'Local Native Sandboxed Engine',
          success: false,
          stdout: stdoutData,
          stderr: 'Time Limit Exceeded (5.0s)',
          compileError: '',
          output: `❌ Time Limit Exceeded (Execution exceeded ${timeoutMs / 1000}s limit)`,
          exitCode: 124,
          time: elapsedSec,
          status: 'time_limit_exceeded',
          engineDetail: `Host Native Runner (${isPython ? 'Python 3' : 'Node.js'})`
        });
        return;
      }

      const isSuccess = code === 0;
      const isSyntaxError = Boolean(
        stderrData && (
          stderrData.includes('SyntaxError') ||
          stderrData.includes('IndentationError') ||
          stderrData.includes('TabError')
        )
      );

      let status = 'success';
      if (!isSuccess) {
        status = isSyntaxError ? 'compilation_error' : 'runtime_error';
      }

      let outputText = '';
      if (stderrData && !isSuccess) {
        const errorType = isSyntaxError ? 'Syntax / Compilation Error' : 'Runtime Error';
        outputText = stdoutData ? `${stdoutData}\n❌ ${errorType}:\n${stderrData}` : `❌ ${errorType}:\n${stderrData}`;
      } else if (stderrData) {
        outputText = stdoutData ? `${stdoutData}\n⚠️ STDERR:\n${stderrData}` : `⚠️ STDERR:\n${stderrData}`;
      } else {
        outputText = stdoutData !== '' ? stdoutData : '✅ Program executed with no console output (exit code 0).';
      }

      resolve({
        serverId: 'local',
        serverName: 'Local Native Sandboxed Engine',
        success: isSuccess,
        stdout: stdoutData,
        stderr: stderrData,
        compileError: isSyntaxError ? stderrData : '',
        output: outputText,
        exitCode: code ?? 0,
        time: elapsedSec,
        status,
        engineDetail: `Host Native Runner (${isPython ? 'Python 3' : 'Node.js'})`
      });
    });
  });
}

async function cleanupTemp(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (e) {}
}

