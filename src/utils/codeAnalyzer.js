/**
 * Code Analyzer & Efficiency Percentage Calculator
 * Evaluates student code for structural completeness, algorithmic complexity,
 * test case coverage, and code completion percentage.
 */

export function analyzeCode(code = "", language = "Python", problem = null, runResults = null) {
  const cleanCode = (code || "").trim();
  const lines = cleanCode.split("\n").filter(l => l.trim().length > 0);
  
  if (!cleanCode || lines.length <= 1) {
    return {
      passPercentage: 0,
      structuralScore: 0,
      status: "Incomplete",
      badgeColor: "rose",
      metrics: {
        hasFunction: false,
        hasReturn: false,
        hasControlFlow: false,
        estimatedTimeComplexity: "O(1)",
        estimatedSpaceComplexity: "O(1)",
        lineCount: lines.length
      },
      feedback: ["Start by defining your solution function and logic."]
    };
  }

  let score = 20; // base score for starting
  const feedback = [];
  const lower = cleanCode.toLowerCase();

  // 1. Function / Structure Check
  let hasFunction = false;
  if (language === "Python" && (lower.includes("def ") || lower.includes("class "))) {
    hasFunction = true;
    score += 25;
  } else if ((language === "JavaScript" || language === "TypeScript") && 
             (lower.includes("function") || lower.includes("=>") || lower.includes("class "))) {
    hasFunction = true;
    score += 25;
  } else if ((language === "Java" || language === "C++" || language === "C") && 
             (lower.includes("void ") || lower.includes("int ") || lower.includes("vector") || lower.includes("class "))) {
    hasFunction = true;
    score += 25;
  } else {
    feedback.push("Organize logic inside a named function or method.");
  }

  // 2. Return / Output Check
  let hasReturn = false;
  if (lower.includes("return ") || lower.includes("print(") || lower.includes("console.log") || lower.includes("cout <<")) {
    hasReturn = true;
    score += 20;
  } else {
    feedback.push("Missing a return statement or output call for the result.");
  }

  // 3. Control Flow & Loops (Logic depth)
  let hasControlFlow = false;
  let loopCount = 0;
  const loopMatches = lower.match(/\b(for|while)\b/g);
  if (loopMatches) {
    loopCount = loopMatches.length;
    hasControlFlow = true;
    score += 15;
  }

  if (lower.includes("if ") || lower.includes("elif ") || lower.includes("else")) {
    score += 10;
  }

  // 4. Data Structure Usage
  let dsUsed = [];
  if (lower.includes("hash") || lower.includes("map") || lower.includes("dict") || lower.includes("{}") || lower.includes("set(")) {
    dsUsed.push("Hash Map / Set");
    score += 10;
  }
  if (lower.includes("[]") || lower.includes("list") || lower.includes("vector") || lower.includes("array")) {
    dsUsed.push("Array / List");
  }

  // 5. Complexity Estimation
  let estimatedTimeComplexity = "O(n)";
  let estimatedSpaceComplexity = "O(1)";

  if (loopCount >= 2) {
    estimatedTimeComplexity = "O(n²)";
    feedback.push("Nested loops detected. Look for opportunities to optimize to O(n) using a Hash Map.");
  } else if (loopCount === 1) {
    if (lower.includes("sort(") || lower.includes(".sort")) {
      estimatedTimeComplexity = "O(n log n)";
    } else {
      estimatedTimeComplexity = "O(n)";
    }
  } else if (loopCount === 0 && hasFunction) {
    estimatedTimeComplexity = "O(1)";
  }

  if (dsUsed.includes("Hash Map / Set")) {
    estimatedSpaceComplexity = "O(n)";
  }

  // 6. Test Case Pass Override (If real execution stats passed)
  let passPercentage = Math.min(score, 100);
  if (runResults) {
    if (runResults.passed !== undefined && runResults.total !== undefined && runResults.total > 0) {
      passPercentage = Math.round((runResults.passed / runResults.total) * 100);
    } else if (runResults.status === "Accepted" || runResults.success === true) {
      passPercentage = 100;
    } else if (runResults.status === "Runtime Error" || runResults.error) {
      passPercentage = Math.min(passPercentage, 45);
    }
  }

  let status = "In Progress";
  let badgeColor = "amber";

  if (passPercentage >= 90) {
    status = "Optimal / Passed";
    badgeColor = "emerald";
  } else if (passPercentage >= 60) {
    status = "Partially Complete";
    badgeColor = "violet";
  } else if (passPercentage < 40) {
    status = "Needs Work";
    badgeColor = "rose";
  }

  return {
    passPercentage,
    structuralScore: score,
    status,
    badgeColor,
    metrics: {
      hasFunction,
      hasReturn,
      hasControlFlow,
      loopCount,
      dsUsed,
      estimatedTimeComplexity,
      estimatedSpaceComplexity,
      lineCount: lines.length
    },
    feedback: feedback.length ? feedback : ["Code logic structure looks solid. Run edge case tests to confirm."]
  };
}
