import { executeCode } from './serverManager.js';
import { normalizeLanguage } from './constants.js';

/**
 * Universal Deterministic Program Comparison & Evaluation Engine
 * 
 * Supports:
 * - Accepted
 * - Wrong Answer
 * - Compilation Error
 * - Runtime Error
 * - Time Limit Exceeded
 * - Memory Limit Exceeded
 * - Internal Execution Error
 * 
 * Configurable Output Comparison Policies:
 * A. 'exact'   : Byte/character-level comparison preserving exact line breaks and spaces.
 * B. 'token'   : Whitespace-separated token comparison.
 * C. 'numeric' : Token comparison with floating-point tolerance (epsilon).
 * D. 'custom'  : Custom regex pattern matching.
 */

/**
 * Normalizes newlines across Windows and Unix (\r\n -> \n)
 */
export function normalizeLineEndings(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Compares actual program output against expected output using a defined policy.
 * 
 * @param {string} actual - Actual stdout from execution
 * @param {string} expected - Expected output
 * @param {string} policy - 'exact' | 'token' | 'numeric' | 'custom'
 * @param {Object} options - { tolerance: number, regexPattern: string }
 * @returns {boolean} Whether the outputs match under the policy
 */
export function compareOutput(actual, expected, policy = 'token', options = {}) {
  const normActual = normalizeLineEndings(actual ?? '');
  const normExpected = normalizeLineEndings(expected ?? '');

  // If no expected output is defined, any non-crashing execution is considered a pass
  if (!normExpected.trim()) {
    return true;
  }

  switch (policy) {
    case 'exact': {
      // Exact comparison: preserve spaces and internal line breaks; strip only one trailing newline if present
      const a = normActual.endsWith('\n') ? normActual.slice(0, -1) : normActual;
      const e = normExpected.endsWith('\n') ? normExpected.slice(0, -1) : normExpected;
      return a === e;
    }

    case 'numeric': {
      // Numeric comparison with configurable floating-point epsilon tolerance
      const tolerance = typeof options.tolerance === 'number' ? options.tolerance : 1e-4;
      const actualTokens = normActual.trim().split(/\s+/).filter(Boolean);
      const expectedTokens = normExpected.trim().split(/\s+/).filter(Boolean);

      if (actualTokens.length !== expectedTokens.length) return false;

      for (let i = 0; i < actualTokens.length; i++) {
        const aNum = Number(actualTokens[i]);
        const eNum = Number(expectedTokens[i]);

        if (!Number.isNaN(aNum) && !Number.isNaN(eNum)) {
          if (Math.abs(aNum - eNum) > tolerance) {
            return false;
          }
        } else if (actualTokens[i] !== expectedTokens[i]) {
          return false;
        }
      }
      return true;
    }

    case 'custom': {
      if (options.regexPattern) {
        try {
          const reg = new RegExp(options.regexPattern);
          return reg.test(normActual);
        } catch (e) {
          console.warn('[Custom Comparison Regex Error]:', e);
        }
      }
      return normActual.trim() === normExpected.trim();
    }

    case 'token':
    default: {
      // Token-based comparison: splits by any whitespace sequence
      const actualTokens = normActual.trim().split(/\s+/).filter(Boolean);
      const expectedTokens = normExpected.trim().split(/\s+/).filter(Boolean);

      if (actualTokens.length !== expectedTokens.length) {
        // Also check if expected text is contained directly in actual
        if (normActual.includes(normExpected.trim())) {
          return true;
        }
        return false;
      }

      for (let i = 0; i < actualTokens.length; i++) {
        if (actualTokens[i] !== expectedTokens[i]) {
          return false;
        }
      }
      return true;
    }
  }
}

/**
 * Universal Program Evaluator
 * 
 * Compiles or verifies source code once, then executes against all test cases concurrently.
 * 
 * @param {Object} options
 * @param {string} options.code - Source code to execute
 * @param {string} options.language - Programming language ('c', 'cpp', 'java', 'python', etc.)
 * @param {Array} options.testCases - Array of test case objects
 * @param {string} options.serverId - Selected compiler server ('default', 'local', 'ce_judge', etc.)
 * @param {number} options.maxPoints - Maximum score for the problem
 * @param {number} options.timeLimitMs - Per-testcase time limit in milliseconds
 */
export async function evaluateSubmission({
  code,
  language,
  testCases = [],
  serverId = 'default',
  maxPoints = 10,
  timeLimitMs = 5000
}) {
  const startTime = performance.now();
  const canonicalLang = normalizeLanguage(language);

  if (!code || !code.trim()) {
    return {
      status: 'Compilation Error',
      success: false,
      totalTestCases: testCases.length,
      passedTestCases: 0,
      pointsEarned: 0,
      executionTimeMs: 0,
      error: 'Empty source code submitted.',
      testCaseResults: []
    };
  }

  // Ensure at least one test case exists
  const normalizedTestCases = (Array.isArray(testCases) && testCases.length > 0)
    ? testCases
    : [
        { id: 1, name: 'Default Verification Case', input: '', expected: '', isHidden: false, policy: 'token' }
      ];

  // 1. First Execution / Compilation Verification Step
  // Fail-fast on syntax or compilation errors before running remaining test cases
  const firstTestCase = normalizedTestCases[0];
  let firstRun;
  try {
    firstRun = await executeCode({
      serverId,
      language: canonicalLang,
      code,
      stdin: firstTestCase.input || '',
      autoFallback: true
    });
  } catch (err) {
    return {
      status: 'Internal Execution Error',
      success: false,
      totalTestCases: normalizedTestCases.length,
      passedTestCases: 0,
      pointsEarned: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
      error: err.message,
      testCaseResults: []
    };
  }

  // Detect Compilation Error
  const isCompilationError = 
    Boolean(firstRun.compileError) ||
    firstRun.status === 'compilation_error' ||
    (firstRun.output && firstRun.output.startsWith('❌ Compilation Error:')) ||
    (firstRun.output && firstRun.output.startsWith('❌ Syntax'));

  if (isCompilationError) {
    const errorDetails = firstRun.compileError || firstRun.stderr || firstRun.output || 'Compilation or syntax error.';
    return {
      status: 'Compilation Error',
      success: false,
      totalTestCases: normalizedTestCases.length,
      passedTestCases: 0,
      pointsEarned: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
      error: errorDetails,
      compileError: errorDetails,
      serverUsed: firstRun.usedServerName || firstRun.usedServer,
      testCaseResults: normalizedTestCases.map((tc, idx) => ({
        id: tc.id || idx + 1,
        name: tc.name || (tc.isHidden ? `Hidden Test Case ${idx + 1}` : `Test Case ${idx + 1}`),
        isHidden: Boolean(tc.isHidden),
        status: 'Compilation Error',
        passed: false,
        error: errorDetails
      }))
    };
  }

  // 2. Parallel Execution for Remaining Test Cases
  const remainingTestCases = normalizedTestCases.slice(1);
  const remainingPromises = remainingTestCases.map(tc =>
    executeCode({
      serverId,
      language: canonicalLang,
      code,
      stdin: tc.input || '',
      autoFallback: true
    }).catch(err => ({
      success: false,
      error: err.message,
      stderr: err.message,
      status: 'runtime_error',
      exitCode: 1
    }))
  );

  const remainingResults = await Promise.all(remainingPromises);
  const allExecResults = [firstRun, ...remainingResults];

  // 3. Output Comparison & Diagnostics
  let passedCount = 0;
  let hasRuntimeError = false;
  let hasTimeout = false;
  let hasWrongAnswer = false;
  let totalExecTimeMs = 0;

  const testCaseResults = normalizedTestCases.map((tc, idx) => {
    const exec = allExecResults[idx];
    const actualRaw = exec.stdout || exec.output || '';
    const policy = tc.comparisonPolicy || tc.policy || 'token';

    const execTimeMs = exec.time ? Math.round(parseFloat(exec.time) * 1000) || 30 : 30;
    totalExecTimeMs += execTimeMs;

    let testCaseStatus = 'Wrong Answer';
    let isPassed = false;
    let errorMessage = null;

    if (exec.status === 'time_limit_exceeded' || exec.exitCode === 124) {
      testCaseStatus = 'Time Limit Exceeded';
      hasTimeout = true;
      errorMessage = 'Execution timed out.';
    } else if (!exec.success && exec.exitCode !== 0) {
      testCaseStatus = 'Runtime Error';
      hasRuntimeError = true;
      errorMessage = exec.stderr || exec.error || `Process exited with code ${exec.exitCode}.`;
    } else {
      // Run comparison policy
      const matches = compareOutput(actualRaw, tc.expected, policy, {
        tolerance: tc.tolerance,
        regexPattern: tc.regexPattern
      });

      if (matches) {
        testCaseStatus = 'Accepted';
        isPassed = true;
        passedCount++;
      } else {
        testCaseStatus = 'Wrong Answer';
        hasWrongAnswer = true;
      }
    }

    return {
      id: tc.id || idx + 1,
      name: tc.name || (tc.isHidden ? `Hidden Test Case ${idx + 1}` : `Test Case ${idx + 1}`),
      isHidden: Boolean(tc.isHidden),
      status: testCaseStatus,
      passed: isPassed,
      executionTime: exec.time || `${(execTimeMs / 1000).toFixed(3)}s`,
      comparisonPolicy: policy,
      // For hidden test cases, mask input and expected output to preserve integrity
      input: tc.isHidden ? '[HIDDEN]' : tc.input || '',
      expected: tc.isHidden ? '[HIDDEN]' : tc.expected || '',
      actual: tc.isHidden ? (isPassed ? '[PASSED]' : '[INCORRECT OUTPUT]') : actualRaw,
      error: errorMessage
    };
  });

  // 4. Overall Submission Verdict
  let finalStatus = 'Accepted';
  if (passedCount === normalizedTestCases.length) {
    finalStatus = 'Accepted';
  } else if (hasTimeout) {
    finalStatus = 'Time Limit Exceeded';
  } else if (hasRuntimeError) {
    finalStatus = 'Runtime Error';
  } else if (hasWrongAnswer) {
    finalStatus = 'Wrong Answer';
  }

  const passRatio = normalizedTestCases.length > 0 ? passedCount / normalizedTestCases.length : 0;
  const pointsEarned = finalStatus === 'Accepted' ? maxPoints : Math.round(maxPoints * passRatio);

  return {
    status: finalStatus,
    success: finalStatus === 'Accepted',
    totalTestCases: normalizedTestCases.length,
    passedTestCases: passedCount,
    pointsEarned,
    maxPoints,
    executionTimeMs: Math.round(performance.now() - startTime),
    serverUsed: firstRun.usedServerName || firstRun.usedServer,
    testCaseResults
  };
}
