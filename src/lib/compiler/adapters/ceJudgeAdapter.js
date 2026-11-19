import { JUDGE0_LANGUAGE_IDS, normalizeJavaCode } from '../constants.js';

/**
 * Server 5: CE.Judge Server Adapter
 * Binary-safe, base64-encoded execution against Judge0 CE (https://ce.judge0.com)
 * Supports C (GCC), C++ (G++), Java (OpenJDK), Python (3.8+), JavaScript (Node.js), Go, Rust
 */
export async function executeCEJudge(code, langKey, stdin = '', { timeoutMs = 15000 } = {}) {
  const languageId = JUDGE0_LANGUAGE_IDS[langKey];
  if (!languageId) {
    throw new Error(`CE.Judge Server does not support language key '${langKey}'.`);
  }

  // Java normalization: Ensure class with main is public class Main
  let processedCode = code;
  if (langKey === 'java' || langKey === '1003') {
    processedCode = normalizeJavaCode(processedCode);
  }

  const rapidApiKey = process.env.JUDGE0_API_KEY?.trim();
  const isRapidApi = rapidApiKey && rapidApiKey !== "paste_your_rapidapi_key_here";

  let url = "https://ce.judge0.com/submissions?base64_encoded=true&wait=true";
  const headers = { "Content-Type": "application/json" };

  if (isRapidApi) {
    url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true";
    headers["x-rapidapi-key"] = rapidApiKey;
    headers["x-rapidapi-host"] = "judge0-ce.p.rapidapi.com";
  } else if (process.env.JUDGE0_HOST) {
    url = `${process.env.JUDGE0_HOST.replace(/\/$/, '')}/submissions?base64_encoded=true&wait=true`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: Buffer.from(processedCode, 'utf8').toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin || '', 'utf8').toString('base64')
      }),
      signal: controller.signal
    });
  } catch (netErr) {
    clearTimeout(timeoutId);
    if (netErr.name === 'AbortError') {
      throw new Error(`CE.Judge Server timed out after ${timeoutMs / 1000}s.`);
    }
    throw new Error(`CE.Judge Connection Failed: ${netErr.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown CE.Judge error");
    throw new Error(`CE.Judge HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf8') : "";
  const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf8') : "";
  const compileError = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf8') : "";
  const message = data.message ? Buffer.from(data.message, 'base64').toString('utf8') : "";
  const statusId = data.status?.id || 0;
  const isSuccess = statusId === 3; // 3 = Accepted in Judge0
  const isCompilationError = statusId === 6 || Boolean(compileError);
  const isTimeout = statusId === 5;

  let executionStatus = 'success';
  if (isCompilationError) {
    executionStatus = 'compilation_error';
  } else if (isTimeout) {
    executionStatus = 'time_limit_exceeded';
  } else if (!isSuccess) {
    executionStatus = 'runtime_error';
  }

  let outputText = "";
  if (compileError) {
    outputText = `❌ Compilation Error:\n${compileError}`;
  } else if (isTimeout) {
    outputText = `❌ Time Limit Exceeded (Exceeded time limit)\n${stdout ? `Partial stdout:\n${stdout}` : ''}`;
  } else if (stderr && !isSuccess) {
    outputText = stdout ? `${stdout}\n❌ Runtime Error:\n${stderr}` : `❌ Runtime Error:\n${stderr}`;
  } else if (stderr) {
    // Non-fatal stderr (compiler warning or standard error stream)
    outputText = stdout ? `${stdout}\n⚠️ STDERR:\n${stderr}` : `⚠️ STDERR:\n${stderr}`;
  } else if (!isSuccess) {
    outputText = stdout ? `${stdout}\n❌ Execution Status: ${data.status?.description || message || "Error"}` : `❌ Execution Status: ${data.status?.description || message || "Error"}`;
  } else {
    // Successful execution (even if stdout is empty)
    outputText = stdout !== "" ? stdout : "✅ Program executed with no console output (exit code 0).";
  }

  return {
    serverId: 'ce_judge',
    serverName: 'CE.Judge Server',
    success: isSuccess,
    stdout,
    stderr: stderr || (!isSuccess && statusId !== 3 ? (data.status?.description || message) : ""),
    compileError,
    output: outputText,
    exitCode: isSuccess ? 0 : (data.exit_code ?? (isCompilationError ? 1 : (isTimeout ? 124 : 1))),
    time: data.time ? `${data.time}s` : undefined,
    memory: data.memory ? `${data.memory} KB` : undefined,
    status: executionStatus,
    engineDetail: `Judge0 CE (ce.judge0.com) - ${data.status?.description || 'Active'}`
  };
}
