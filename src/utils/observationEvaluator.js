/**
 * Smart Digital Lab Observation Automated Evaluation Engine
 * Evaluates student lab observations out of 10 marks:
 *  1. Program correctness & logic (Max 3)
 *  2. Output accuracy & test cases (Max 3)
 *  3. Algorithm correctness (Max 2)
 *  4. Observation completeness & result (Max 1)
 *  5. Code quality & structure (Max 1)
 * Total: 10 Marks
 *
 * NOTE: AI marks are strictly provisional recommendations;
 * final academic marks are awarded by the assigned faculty member.
 */

export function evaluateObservation({
  task,
  aim = '',
  algorithm = '',
  programCode = '',
  executionOutput = '',
  result = '',
  studentRemarks = '',
  executedCodeSnapshot = '',
  executedOutputSnapshot = '',
  language = 'java',
  exitCode = 0,
  executionStatus = 'SUCCESS'
}) {
  const code = (programCode || executedCodeSnapshot || '').trim();
  const output = (executionOutput || executedOutputSnapshot || '').trim();
  const cleanAim = (aim || '').trim();
  const cleanAlgo = (algorithm || '').trim();
  const cleanResult = (result || '').trim();
  const lowerCode = code.toLowerCase();

  const mistakes = [];
  const suggestions = [];

  // ==========================================
  // 1. Program Correctness & Logic (Max: 3.0)
  // ==========================================
  let programScore = 0;
  let compilationStatus = 'COMPILED_CLEANLY';

  if (!code || code.length === 0) {
    mistakes.push('No program source code provided.');
    compilationStatus = 'COMPILATION_ERROR';
  } else if (exitCode !== 0 || executionStatus !== 'SUCCESS' || output.includes('❌') || output.includes('Error:') || output.includes('Exception in thread')) {
    compilationStatus = output.includes('Compilation Error') ? 'COMPILATION_ERROR' : 'RUNTIME_ERROR';
    mistakes.push(`Program execution failed with exit code ${exitCode}. Error detected in output.`);
    suggestions.push('Review compiler error messages, check variable scopes and null references.');
    programScore = 0.5; // Minimal credit for attempting code
  } else {
    // Program compiled and executed without runtime crash
    programScore += 1.5;

    // Check language structure
    const lang = (language || 'java').toLowerCase();

    let hasEntry = false;
    if (lang.includes('java')) {
      hasEntry = lowerCode.includes('public static void main') || lowerCode.includes('class ');
    } else if (lang.includes('c++') || lang === 'cpp') {
      hasEntry = lowerCode.includes('int main') || lowerCode.includes('void main');
    } else if (lang === 'c') {
      hasEntry = lowerCode.includes('int main') || lowerCode.includes('void main');
    } else if (lang.includes('python')) {
      hasEntry = lowerCode.includes('def ') || lowerCode.includes('print(') || lowerCode.includes('if __name__');
    } else if (lang.includes('javascript') || lang.includes('typescript')) {
      hasEntry = lowerCode.includes('function') || lowerCode.includes('=>') || lowerCode.includes('console.log');
    } else {
      hasEntry = code.length > 20;
    }

    if (hasEntry) {
      programScore += 0.5;
    } else {
      mistakes.push(`Standard ${language} entry point/structure missing.`);
      suggestions.push(`Ensure standard entry method and proper class structure for ${language}.`);
    }

    // Logic depth check (loops, branches, operations)
    const hasLoops = /\b(for|while|do)\b/.test(lowerCode);
    const hasBranches = /\b(if|else|switch|case)\b/.test(lowerCode);
    const lineCount = code.split('\n').filter(l => l.trim().length > 0).length;

    if (lineCount >= 5 && (hasLoops || hasBranches || lineCount >= 10)) {
      programScore += 1.0;
    } else if (lineCount >= 3) {
      programScore += 0.5;
      suggestions.push('Consider modularizing your algorithm with dedicated helper functions or loops.');
    } else {
      mistakes.push('Program code is too trivial or brief.');
    }
  }

  programScore = Math.min(3.0, Math.max(0, programScore));

  // ==========================================
  // 2. Output Accuracy & Test Cases (Max: 3.0)
  // ==========================================
  let outputScore = 0;
  let testCasesPassed = 0;
  let testCasesFailed = 0;
  let requiresFacultyVerification = false;

  const hasOutput = output && output.length > 0 && !output.includes('⚠️ Click Run') && !output.includes('❌');

  if (!hasOutput) {
    mistakes.push('No verified compiler execution output found.');
    suggestions.push('Execute your code in Code Space before submitting observation.');
    outputScore = 0;
  } else {
    // Check if task defines expectedOutput or testCases
    let expectedOutput = task?.expectedOutput?.trim();
    let parsedTestCases = null;

    if (task?.testCases) {
      try {
        parsedTestCases = typeof task.testCases === 'string' ? JSON.parse(task.testCases) : task.testCases;
      } catch (e) {
        parsedTestCases = null;
      }
    }

    if (parsedTestCases && Array.isArray(parsedTestCases) && parsedTestCases.length > 0) {
      // Test cases provided
      let passed = 0;
      for (const tc of parsedTestCases) {
        const expected = (tc.expected || tc.expectedOutput || '').trim().toLowerCase();
        if (expected && output.toLowerCase().includes(expected)) {
          passed++;
        }
      }
      testCasesPassed = passed;
      testCasesFailed = parsedTestCases.length - passed;

      const passRatio = passed / parsedTestCases.length;
      outputScore = Math.round(passRatio * 3.0 * 10) / 10;

      if (testCasesFailed > 0) {
        mistakes.push(`${testCasesFailed} of ${parsedTestCases.length} automated test cases did not match expected output.`);
        suggestions.push('Verify edge cases and output formatting (case sensitivity, whitespace, trailing newlines).');
      }
    } else if (expectedOutput) {
      // Single expected output comparison
      const normalizedActual = output.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedExpected = expectedOutput.toLowerCase().replace(/\s+/g, ' ').trim();

      if (normalizedActual === normalizedExpected || normalizedActual.includes(normalizedExpected)) {
        outputScore = 3.0;
        testCasesPassed = 1;
      } else {
        outputScore = 1.5;
        testCasesFailed = 1;
        mistakes.push('Output differs from faculty expected reference output.');
        suggestions.push('Check spacing, capitalization, and prompt text against the problem manual.');
      }
    } else {
      // No predefined test cases: verify non-error substantial output and mark for faculty verification
      requiresFacultyVerification = true;
      outputScore = 2.5; // Provisional score assuming valid compiler run
      testCasesPassed = 1;
      suggestions.push('Faculty review required to confirm domain output values.');
    }
  }

  outputScore = Math.min(3.0, Math.max(0, outputScore));

  // ==========================================
  // 3. Algorithm Correctness (Max: 2.0)
  // ==========================================
  let algoScore = 0;

  if (!cleanAlgo || cleanAlgo.length === 0) {
    mistakes.push('Algorithm is missing.');
    suggestions.push('Provide step-by-step procedural logic (e.g. Step 1: Start, Step 2: ...).');
    algoScore = 0;
  } else {
    const algoLines = cleanAlgo.split('\n').filter(l => l.trim().length > 0);
    const lowerAlgo = cleanAlgo.toLowerCase();

    // Check for step-by-step format
    const hasStepKeywords = /\b(step\s*\d+|1\.|2\.|start|stop|end|begin|input|read|display|print)\b/i.test(cleanAlgo);
    const hasStartStop = (lowerAlgo.includes('start') || lowerAlgo.includes('begin')) && (lowerAlgo.includes('stop') || lowerAlgo.includes('end'));

    if (algoLines.length >= 4 && hasStepKeywords) {
      algoScore += 1.0;
    } else if (algoLines.length >= 2) {
      algoScore += 0.5;
      suggestions.push('Structure your algorithm clearly with numbered steps (Step 1, Step 2, etc.).');
    }

    if (hasStartStop) {
      algoScore += 0.5;
    } else {
      suggestions.push('Standard algorithms should explicitly begin with "Start" and conclude with "Stop".');
    }

    // Check alignment between algorithm and problem / code
    const titleWords = (task?.title || cleanAim).toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchesProblem = titleWords.some(w => lowerAlgo.includes(w) || lowerCode.includes(w));

    if (matchesProblem || algoLines.length >= 5) {
      algoScore += 0.5;
    }
  }

  algoScore = Math.min(2.0, Math.max(0, algoScore));

  // ==========================================
  // 4. Observation Completeness & Result (Max: 1.0)
  // ==========================================
  let completenessScore = 0;

  const hasAim = cleanAim.length >= 5;
  const hasResult = cleanResult.length >= 5;
  const hasCode = code.length >= 10;
  const hasAlgo = cleanAlgo.length >= 10;
  const hasOut = output.length >= 3;

  const completedSections = [hasAim, hasAlgo, hasCode, hasOut, hasResult].filter(Boolean).length;

  if (completedSections === 5) {
    completenessScore = 1.0;
  } else if (completedSections >= 4) {
    completenessScore = 0.7;
    mistakes.push('One of the observation sections is incomplete or too brief.');
  } else if (completedSections >= 3) {
    completenessScore = 0.5;
    mistakes.push('Multiple observation fields are incomplete.');
  } else {
    completenessScore = 0.2;
    mistakes.push('Observation document lacks critical sections.');
  }

  if (!hasResult) {
    suggestions.push('Provide a clear concluding statement in the Result field describing what was verified.');
  }

  completenessScore = Math.min(1.0, Math.max(0, completenessScore));

  // ==========================================
  // 5. Code Quality & Structure (Max: 1.0)
  // ==========================================
  let qualityScore = 0;

  if (code.length > 0) {
    const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
    const lines = code.split('\n');
    const isIndented = lines.some(l => l.startsWith('  ') || l.startsWith('\t'));
    const lineCount = lines.filter(l => l.trim().length > 0).length;

    if (isIndented && lineCount >= 4) {
      qualityScore += 0.5;
    } else {
      suggestions.push('Improve code indentation and formatting for academic legibility.');
    }

    if (hasComments) {
      qualityScore += 0.5;
    } else {
      suggestions.push('Add educational comments explaining variables and algorithm steps.');
    }
  }

  qualityScore = Math.min(1.0, Math.max(0, qualityScore));

  // ==========================================
  // Total Calculation
  // ==========================================
  const totalMarks = Math.round((programScore + outputScore + algoScore + completenessScore + qualityScore) * 10) / 10;
  const correctnessPercentage = Math.round((totalMarks / 10.0) * 100);

  // If student modified populated program code or output, note it
  const hasManualModifications = 
    Boolean(executedCodeSnapshot && code !== executedCodeSnapshot) ||
    Boolean(executedOutputSnapshot && output !== executedOutputSnapshot);

  if (hasManualModifications) {
    mistakes.push('Submitted code or output deviates from original execution snapshot. Faculty verification advised.');
  }

  return {
    totalMarks, // float out of 10
    correctnessPercentage,
    compilationStatus,
    requiresFacultyVerification,
    hasManualModifications,
    testCasesPassed,
    testCasesFailed,
    breakdown: {
      programCorrectness: {
        score: programScore,
        max: 3,
        label: 'Program Correctness & Logic'
      },
      outputAccuracy: {
        score: outputScore,
        max: 3,
        label: 'Output Accuracy & Test Cases'
      },
      algorithmCorrectness: {
        score: algoScore,
        max: 2,
        label: 'Algorithm Correctness'
      },
      observationCompleteness: {
        score: completenessScore,
        max: 1,
        label: 'Observation Completeness & Result'
      },
      codeQuality: {
        score: qualityScore,
        max: 1,
        label: 'Code Quality & Structure'
      }
    },
    identifiedMistakes: mistakes,
    suggestions: suggestions,
    evaluatedAt: new Date().toISOString()
  };
}
