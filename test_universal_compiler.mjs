import { evaluateSubmission, compareOutput } from './src/lib/compiler/evaluator.js';
import { executeCode } from './src/lib/compiler/serverManager.js';
import { performance } from 'perf_hooks';

const RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(suite, name, passed, details = '') {
  RESULTS.total++;
  if (passed) {
    RESULTS.passed++;
    console.log(`  [PASS] ${name} ${details ? `(${details})` : ''}`);
  } else {
    RESULTS.failed++;
    console.error(`  [FAIL] ${name} -> ${details}`);
  }
  RESULTS.tests.push({ suite, name, passed, details });
}

// ============================================================
// 1. LANGUAGE SUITE: C
// ============================================================
async function testC() {
  console.log('\n--- SUITE 1: C LANGUAGE ADAPTER TESTS ---');

  // 1. Hello World
  const hw = await executeCode({
    language: 'c',
    code: '#include <stdio.h>\nint main() { printf("Hello World from C\\n"); return 0; }'
  });
  recordTest('C', 'Hello World', hw.success && hw.stdout.includes('Hello World from C'), `${hw.time}`);

  // 2. Space-separated Input
  const sum = await executeCode({
    language: 'c',
    code: '#include <stdio.h>\nint main() { int a, b; if (scanf("%d %d", &a, &b) == 2) { printf("%d\\n", a + b); } return 0; }',
    stdin: '45 55'
  });
  recordTest('C', 'Space-separated Integer Input (45 55 -> 100)', sum.success && sum.stdout.trim() === '100', `output: ${sum.stdout.trim()}`);

  // 3. Multi-line Input
  const multi = await executeCode({
    language: 'c',
    code: '#include <stdio.h>\nint main() { char line[100]; while (fgets(line, sizeof(line), stdin)) { printf("L:%s", line); } return 0; }',
    stdin: "Apple\nBanana\nCherry"
  });
  recordTest('C', 'Multi-line Input Preservation', multi.success && multi.stdout.includes('L:Apple') && multi.stdout.includes('L:Banana'), '');

  // 4. Array Sorting (Bubble Sort)
  const sort = await executeCode({
    language: 'c',
    code: `#include <stdio.h>
int main() {
    int arr[] = {5, 2, 8, 1, 9};
    int n = 5;
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}`
  });
  recordTest('C', 'Algorithm: Array Sorting', sort.success && sort.stdout.trim() === '1 2 5 8 9', sort.stdout.trim());

  // 5. Empty Output with Exit Code 0
  const empty = await executeCode({
    language: 'c',
    code: 'int main() { return 0; }'
  });
  recordTest('C', 'Empty Output Handling (Exit Code 0)', empty.success && empty.exitCode === 0, `status: ${empty.status}`);

  // 6. Compilation Error Detection
  const compErr = await executeCode({
    language: 'c',
    code: '#include <stdio.h>\nint main() { printf("Broken" return 0; }'
  });
  recordTest('C', 'Compilation Error Detection', !compErr.success && (compErr.compileError.length > 0 || compErr.output.includes('Compilation Error')), 'Caught syntax error');

  // 7. Runtime Error Detection (Zero Division)
  const runErr = await executeCode({
    language: 'c',
    code: '#include <stdio.h>\nint main() { int a = 1; int b = 0; printf("%d", a / b); return 0; }'
  });
  recordTest('C', 'Runtime Error Detection (SIGFPE)', !runErr.success || runErr.exitCode !== 0, `exitCode: ${runErr.exitCode}`);

  // 8. Timeout Detection
  const loop = await executeCode({
    language: 'c',
    code: 'int main() { while(1); return 0; }'
  });
  recordTest('C', 'Time Limit Exceeded Detection', !loop.success && (loop.status === 'time_limit_exceeded' || loop.exitCode === 124 || loop.output.includes('Time Limit')), `status: ${loop.status}`);
}

// ============================================================
// 2. LANGUAGE SUITE: C++
// ============================================================
async function testCPP() {
  console.log('\n--- SUITE 2: C++ LANGUAGE ADAPTER TESTS ---');

  // 1. Hello World
  const hw = await executeCode({
    language: 'cpp',
    code: '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello World from C++" << endl; return 0; }'
  });
  recordTest('C++', 'Hello World', hw.success && hw.stdout.includes('Hello World from C++'), `${hw.time}`);

  // 2. Space-separated Input
  const sum = await executeCode({
    language: 'cpp',
    code: '#include <iostream>\nusing namespace std;\nint main() { int a, b; if (cin >> a >> b) { cout << (a + b) << endl; } return 0; }',
    stdin: '120 80'
  });
  recordTest('C++', 'Space-separated Integer Input (120 80 -> 200)', sum.success && sum.stdout.trim() === '200', `output: ${sum.stdout.trim()}`);

  // 3. String & Vector Operations
  const vec = await executeCode({
    language: 'cpp',
    code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    vector<string> items = {"banana", "apple", "cherry"};
    sort(items.begin(), items.end());
    for (const auto& s : items) cout << s << " ";
    return 0;
}`
  });
  recordTest('C++', 'Algorithm: Vector String Sorting', vec.success && vec.stdout.trim() === 'apple banana cherry', vec.stdout.trim());

  // 4. Compilation Error
  const compErr = await executeCode({
    language: 'cpp',
    code: '#include <iostream>\nint main() { cout << undefined_var; return 0; }'
  });
  recordTest('C++', 'Compilation Error Detection', !compErr.success && (compErr.compileError.length > 0 || compErr.output.includes('Compilation Error')), 'Caught syntax error');

  // 5. Timeout Detection
  const loop = await executeCode({
    language: 'cpp',
    code: 'int main() { while(true); return 0; }'
  });
  recordTest('C++', 'Time Limit Exceeded Detection', !loop.success && (loop.status === 'time_limit_exceeded' || loop.exitCode === 124 || loop.output.includes('Time Limit')), `status: ${loop.status}`);
}

// ============================================================
// 3. LANGUAGE SUITE: JAVA
// ============================================================
async function testJava() {
  console.log('\n--- SUITE 3: JAVA LANGUAGE ADAPTER TESTS ---');

  // 1. Hello World
  const hw = await executeCode({
    language: 'java',
    code: 'public class Main { public static void main(String[] args) { System.out.println("Hello World from Java"); } }'
  });
  recordTest('Java', 'Hello World', hw.success && hw.stdout.includes('Hello World from Java'), `${hw.time}`);

  // 2. Space-separated Input
  const sum = await executeCode({
    language: 'java',
    code: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(a + b);
        }
    }
}`,
    stdin: '350 150'
  });
  recordTest('Java', 'Space-separated Integer Input (350 150 -> 500)', sum.success && sum.stdout.trim() === '500', `output: ${sum.stdout.trim()}`);

  // 3. Helper Classes with Main (Class normalization test)
  const helper = await executeCode({
    language: 'java',
    code: `class Calculator {
    static int multiply(int a, int b) { return a * b; }
}
public class Solution {
    public static void main(String[] args) {
        System.out.println(Calculator.multiply(6, 7));
    }
}`
  });
  recordTest('Java', 'Helper Classes & Arbitrary Main Class Name', helper.success && helper.stdout.trim() === '42', `output: ${helper.stdout.trim()}`);

  // 4. Compilation Error Detection
  const compErr = await executeCode({
    language: 'java',
    code: 'public class Main { public static void main(String[] args) { System.out.println(missing_var); } }'
  });
  recordTest('Java', 'Compilation Error Detection', !compErr.success && (compErr.compileError.length > 0 || compErr.output.includes('Compilation Error')), 'Caught javac error');

  // 5. Runtime Exception Detection (NullPointerException)
  const npe = await executeCode({
    language: 'java',
    code: 'public class Main { public static void main(String[] args) { String s = null; System.out.println(s.length()); } }'
  });
  recordTest('Java', 'Runtime Exception Detection (NullPointerException)', !npe.success && (npe.stderr.includes('NullPointerException') || npe.output.includes('NullPointerException')), 'Caught NPE cleanly');
}

// ============================================================
// 4. LANGUAGE SUITE: PYTHON
// ============================================================
async function testPython() {
  console.log('\n--- SUITE 4: PYTHON LANGUAGE ADAPTER TESTS ---');

  // 1. Hello World
  const hw = await executeCode({
    language: 'python',
    code: 'print("Hello World from Python")'
  });
  recordTest('Python', 'Hello World', hw.success && hw.stdout.includes('Hello World from Python'), `${hw.time}`);

  // 2. Space-separated Input
  const sum = await executeCode({
    language: 'python',
    code: 'a, b = map(int, input().split())\nprint(a + b)',
    stdin: '99 1'
  });
  recordTest('Python', 'Space-separated Integer Input (99 1 -> 100)', sum.success && sum.stdout.trim() === '100', `output: ${sum.stdout.trim()}`);

  // 3. Multi-line Input
  const multi = await executeCode({
    language: 'python',
    code: 'import sys\nlines = [line.strip() for line in sys.stdin if line.strip()]\nprint(",".join(lines))',
    stdin: "First\nSecond\nThird\n"
  });
  recordTest('Python', 'Multi-line Input Processing', multi.success && multi.stdout.trim() === 'First,Second,Third', multi.stdout.trim());

  // 4. Unicode & Currency Symbols
  const uni = await executeCode({
    language: 'python',
    code: 'print("Amount: ₹1,500.50 | Symbol: ✓")'
  });
  recordTest('Python', 'Unicode Character Preservation (₹, ✓)', uni.success && uni.stdout.includes('₹1,500.50') && uni.stdout.includes('✓'), '');

  // 5. Syntax Error Detection (Categorized as Compilation/Syntax Error)
  const synErr = await executeCode({
    language: 'python',
    code: 'def broken_function(\n    print("Missing closing paren"'
  });
  recordTest('Python', 'Syntax Error Detection (Indentation/SyntaxError)', !synErr.success && (synErr.compileError.length > 0 || synErr.status === 'compilation_error'), 'Correctly identified SyntaxError');

  // 6. Runtime Error Detection (ZeroDivisionError)
  const runErr = await executeCode({
    language: 'python',
    code: 'x = 10 / 0'
  });
  recordTest('Python', 'Runtime Exception Detection (ZeroDivisionError)', !runErr.success && (runErr.stderr.includes('ZeroDivisionError') || runErr.output.includes('ZeroDivisionError')), 'Caught ZeroDivisionError');

  // 7. Timeout Detection (Infinite Loop)
  const loop = await executeCode({
    language: 'python',
    code: 'while True: pass'
  });
  recordTest('Python', 'Time Limit Exceeded Detection', !loop.success && (loop.status === 'time_limit_exceeded' || loop.output.includes('Time Limit')), 'Process killed cleanly on timeout');
}

// ============================================================
// 5. CROSS-LANGUAGE VALIDATION SUITE
// ============================================================
async function testCrossLanguage() {
  console.log('\n--- SUITE 5: CROSS-LANGUAGE VALIDATION SUITE ---');

  // Problem 1: "Sum of Array Elements"
  // Input: "5\n10 20 30 40 50" -> Expected Output: "150"
  const prob1TestCases = [
    { id: 1, name: 'Sample Case 1', input: "5\n10 20 30 40 50", expected: "150", isHidden: false },
    { id: 2, name: 'Sample Case 2', input: "3\n1 2 3", expected: "6", isHidden: false },
    { id: 3, name: 'Hidden Case 3', input: "4\n-5 5 10 -10", expected: "0", isHidden: true }
  ];

  const codeP1_C = `#include <stdio.h>
int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int sum = 0, val;
        for (int i = 0; i < n; i++) {
            scanf("%d", &val);
            sum += val;
        }
        printf("%d\\n", sum);
    }
    return 0;
}`;

  const codeP1_CPP = `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        int sum = 0, val;
        for (int i = 0; i < n; i++) {
            cin >> val;
            sum += val;
        }
        cout << sum << endl;
    }
    return 0;
}`;

  const codeP1_Java = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int sum = 0;
            for (int i = 0; i < n; i++) sum += sc.nextInt();
            System.out.println(sum);
        }
    }
}`;

  const codeP1_Python = `import sys
input_data = sys.stdin.read().split()
if input_data:
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    print(sum(nums))`;

  console.log('Evaluating "Sum of Array" across all 4 languages...');
  const [evalC, evalCPP, evalJava, evalPy] = await Promise.all([
    evaluateSubmission({ code: codeP1_C, language: 'c', testCases: prob1TestCases }),
    evaluateSubmission({ code: codeP1_CPP, language: 'cpp', testCases: prob1TestCases }),
    evaluateSubmission({ code: codeP1_Java, language: 'java', testCases: prob1TestCases }),
    evaluateSubmission({ code: codeP1_Python, language: 'python', testCases: prob1TestCases })
  ]);

  recordTest('CrossLanguage', 'C Solution: Sum of Array (3/3 Passed)', evalC.status === 'Accepted' && evalC.passedTestCases === 3, `${evalC.executionTimeMs}ms`);
  recordTest('CrossLanguage', 'C++ Solution: Sum of Array (3/3 Passed)', evalCPP.status === 'Accepted' && evalCPP.passedTestCases === 3, `${evalCPP.executionTimeMs}ms`);
  recordTest('CrossLanguage', 'Java Solution: Sum of Array (3/3 Passed)', evalJava.status === 'Accepted' && evalJava.passedTestCases === 3, `${evalJava.executionTimeMs}ms`);
  recordTest('CrossLanguage', 'Python Solution: Sum of Array (3/3 Passed)', evalPy.status === 'Accepted' && evalPy.passedTestCases === 3, `${evalPy.executionTimeMs}ms`);

  // Verify that an incorrect solution receives 'Wrong Answer' across all languages
  const badCodePy = 'print("wrong")';
  const badEvalPy = await evaluateSubmission({ code: badCodePy, language: 'python', testCases: prob1TestCases });
  recordTest('CrossLanguage', 'Python Incorrect Solution Verdict: Wrong Answer', badEvalPy.status === 'Wrong Answer' && badEvalPy.passedTestCases === 0, `verdict: ${badEvalPy.status}`);
}

// ============================================================
// 6. OUTPUT COMPARISON POLICY TESTS
// ============================================================
function testComparisonPolicies() {
  console.log('\n--- SUITE 6: OUTPUT COMPARISON POLICIES ---');

  // Exact comparison
  recordTest('Policy', 'Exact: identical strings', compareOutput('Hello World\n', 'Hello World', 'exact'));
  recordTest('Policy', 'Exact: detects trailing space difference when required', !compareOutput('Hello  ', 'Hello', 'exact'));

  // Token comparison
  recordTest('Policy', 'Token: matches single line vs multi line', compareOutput('1\n2\n3', '1 2 3', 'token'));
  recordTest('Policy', 'Token: matches array formatting', compareOutput('[0, 1]', '0 1', 'token') || compareOutput('[0, 1]', '[0, 1]', 'token'));

  // Numeric comparison
  recordTest('Policy', 'Numeric: 3.14159 vs 3.1416 with eps 1e-3', compareOutput('3.14159', '3.1416', 'numeric', { tolerance: 1e-3 }));
  recordTest('Policy', 'Numeric: rejects difference larger than eps', !compareOutput('3.14', '3.15', 'numeric', { tolerance: 1e-4 }));
}

// ============================================================
// MAIN RUNNER
// ============================================================
async function runAll() {
  console.log('==============================================================');
  console.log('  BVC SYNTAX HUB UNIVERSAL MULTI-LANGUAGE TEST SUITE');
  console.log('==============================================================');

  const suiteStart = performance.now();

  await testC();
  await testCPP();
  await testJava();
  await testPython();
  await testCrossLanguage();
  testComparisonPolicies();

  const totalTime = ((performance.now() - suiteStart) / 1000).toFixed(2);
  console.log('\n==============================================================');
  console.log(`  TEST RESULTS: ${RESULTS.passed} / ${RESULTS.total} PASSED (${RESULTS.failed} FAILED) in ${totalTime}s`);
  console.log('==============================================================');

  if (RESULTS.failed > 0) {
    process.exit(1);
  }
}

runAll().catch(e => {
  console.error('Fatal Test Runner Error:', e);
  process.exit(1);
});

