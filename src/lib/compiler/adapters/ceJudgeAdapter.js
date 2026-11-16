import { JUDGE0_LANGUAGE_IDS, normalizeJavaCode } from '../constants.js';

/**
 * Server 5: CE.Judge Server Adapter
 * Official Judge0 CE REST API (https://ce.judge0.com)
 */
export async function executeCEJudge(code, langKey, stdin, { timeoutMs = 15000 } = {}) {
  const languageId = JUDGE0_LANGUAGE_IDS[langKey];
  if (!languageId) {
    throw new Error(`CE.Judge Server does not support language key '${langKey}'.`);
  }

  // Java normalization: Ensure class with main is named Main
  let processedCode = code;
  if (langKey === 'java' || langKey === '1003') {
    processedCode = normalizeJavaCode(processedCode);
  }

  const rapidApiKey = process.env.JUDGE0_API_KEY?.trim();
  const isRapidApi = rapidApiKey && rapidApiKey !== "paste_your_rapidapi_key_here";

  let url = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
  const headers = { "Content-Type": "application/json" };

  if (isRapidApi) {
    url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
    headers["x-rapidapi-key"] = rapidApiKey;
    headers["x-rapidapi-host"] = "judge0-ce.p.rapidapi.com";
  } else if (process.env.JUDGE0_HOST) {
    url = `${process.env.JUDGE0_HOST.replace(/\/$/, '')}/submissions?base64_encoded=false&wait=true`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: processedCode,
        language_id: languageId,
        stdin: stdin || ""
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
  const stdout = data.stdout || "";
  const stderr = data.stderr || "";
  const compileError = data.compile_output || "";
  const message = data.message || "";
  const statusId = data.status?.id || 0;
  const isSuccess = statusId === 3; // 3 = Accepted in Judge0

  let outputText = "";
  if (compileError) {
    outputText = `❌ Compilation Error:\n${compileError}`;
  } else if (stderr) {
    outputText = stdout ? `${stdout}\n⚠️ STDERR:\n${stderr}` : `⚠️ STDERR:\n${stderr}`;
  } else if (statusId !== 3) {
    outputText = `❌ Execution Status: ${data.status?.description || message || "Runtime error"}\n${stderr || ""}`;
  } else {
    outputText = stdout || "✅ Program executed with no output.";
  }

  return {
    serverId: 'ce_judge',
    serverName: 'CE.Judge Server',
    success: isSuccess,
    stdout,
    stderr: stderr || (statusId !== 3 ? data.status?.description : ""),
    compileError,
    output: outputText,
    exitCode: isSuccess ? 0 : 1,
    time: data.time ? `${data.time}s` : undefined,
    memory: data.memory ? `${data.memory} KB` : undefined,
    engineDetail: 'Judge0 CE (ce.judge0.com)'
  };
}
