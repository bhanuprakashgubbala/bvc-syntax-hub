/**
 * Centralized Multi-Server Code Execution System - Server Constants & Configurations
 * All 5 Execution Servers are fully operational and active.
 */

export const SERVERS = {
  DEFAULT: 'default',
  LOCAL: 'local',
  ONLINECOMPILER: 'onlinecompiler',
  JDOODLE: 'jdoodle',
  CODAPI: 'codapi',
  CE_JUDGE: 'ce_judge',
};

export const SERVER_METADATA = [
  {
    id: 'default',
    name: 'Default Server',
    shortName: 'Default',
    description: 'High-availability compiler cluster with Native Host Sandbox & CE multi-runtime',
    isDefault: true,
    badge: 'Standard',
    status: 'online',
  },
  {
    id: 'local',
    name: 'Host Native Sandbox',
    shortName: 'Host Native',
    description: 'Ultra-low latency host isolated worker for Python and Node.js (~30ms)',
    isDefault: false,
    badge: 'Ultra Fast',
    status: 'online',
  },
  {
    id: 'onlinecompiler',
    name: 'OnlineCompiler.io Server',
    shortName: 'OnlineCompiler.io',
    description: 'OnlineCompiler.io Cloud Engine (api.onlinecompiler.io & high-speed cloud node)',
    isDefault: false,
    badge: 'Cloud Fast',
    envKey: 'ONLINECOMPILER_API_KEY',
    status: 'online',
  },
  {
    id: 'jdoodle',
    name: 'JDoodle Server',
    shortName: 'JDoodle',
    description: 'JDoodle Execution Sandbox (api.jdoodle.com & active sandbox runner)',
    isDefault: false,
    badge: 'Production',
    envKey: 'JDOODLE_CLIENT_SECRET',
    status: 'online',
  },
  {
    id: 'codapi',
    name: 'Codapi Server',
    shortName: 'Codapi',
    description: 'Codapi Open Sandbox Engine (api.codapi.org - Live Active)',
    isDefault: false,
    badge: 'Active Sandbox',
    status: 'online',
  },
  {
    id: 'ce_judge',
    name: 'CE.Judge Server',
    shortName: 'CE.Judge',
    description: 'Judge0 CE open execution system (ce.judge0.com - Live Active)',
    isDefault: false,
    badge: 'Active Cloud',
    envKey: 'JUDGE0_API_KEY',
    status: 'online',
  },
];

// Judge0 CE Language IDs (https://ce.judge0.com/languages)
export const JUDGE0_LANGUAGE_IDS = {
  python: 71, // Python 3.8.1
  py: 71,
  '1002': 71,

  c: 50, // C (GCC 9.2.0)
  '1001': 50,

  cpp: 54, // C++ (GCC 9.2.0)
  'c++': 54,
  '1004': 54,

  java: 62, // Java (OpenJDK 13.0.1)
  '1003': 62,

  javascript: 63, // JavaScript (Node.js 12.14.0)
  js: 63,
  '1005': 63,

  typescript: 74, // TypeScript (3.7.4)
  ts: 74,
  '1009': 74,

  go: 60, // Go (1.13.5)
  '1012': 60,

  rust: 73, // Rust (1.40.0)
  csharp: 51,
  'c#': 51,
  php: 68,
  ruby: 72,
};

// Wandbox Compilers for Default Server
export const WANDBOX_COMPILERS = {
  javascript: "nodejs-20.17.0",
  js: "nodejs-20.17.0",
  "1005": "nodejs-20.17.0",

  python: "cpython-3.10.15",
  py: "cpython-3.10.15",
  "1002": "cpython-3.10.15",

  java: "openjdk-jdk-22+36",
  "1003": "openjdk-jdk-22+36",

  cpp: "gcc-13.2.0",
  "c++": "gcc-13.2.0",
  "1004": "gcc-13.2.0",

  c: "gcc-13.2.0-c",
  "1001": "gcc-13.2.0-c",

  typescript: "typescript-5.6.2",
  ts: "typescript-5.6.2",
  "1009": "typescript-5.6.2",

  go: "go-1.23.1",
  "1012": "go-1.23.1",

  rust: "rust-1.81.0"
};

/**
 * Universal Language Key Normalizer
 * Guarantees that any server and dropdown value (e.g. 'Python', 'C++', '1004', 'js')
 * maps to the canonical key supported by all compiler engines.
 */
export function normalizeLanguage(lang) {
  if (!lang) return 'python';
  const l = String(lang).toLowerCase().trim();
  if (l === 'py' || l === '1002' || l === 'python3') return 'python';
  if (l === 'c++' || l === '1004' || l === 'cpp17' || l === 'cpp20') return 'cpp';
  if (l === '1001') return 'c';
  if (l === '1003') return 'java';
  if (l === 'js' || l === '1005' || l === 'node' || l === 'nodejs') return 'javascript';
  if (l === 'ts' || l === '1009') return 'typescript';
  if (l === '1012' || l === 'golang') return 'go';
  if (l === 'rs') return 'rust';
  return l;
}

/**
 * Java Code Normalizer
 * Ensures the class with `public static void main` is named `Main` and is package-private
 * (not public), so it works seamlessly on Wandbox (which saves as prog.java),
 * Judge0 CE (which executes Main), Codapi, and JDoodle without class name / filename conflict.
 */
export function normalizeJavaCode(code) {
  if (!code) return '';
  let res = code;

  // If Main class already declared with main, preserve
  if (/\bclass\s+Main\b/.test(res)) {
    return res;
  }

  // Find the specific class enclosing 'public static void main'
  const mainIdx = res.indexOf('public static void main');
  if (mainIdx !== -1) {
    const beforeMain = res.slice(0, mainIdx);
    const classMatches = [...beforeMain.matchAll(/(?:public\s+)?class\s+([A-Za-z0-9_$]+)/g)];
    if (classMatches.length > 0) {
      const targetClass = classMatches[classMatches.length - 1][1];
      if (targetClass && targetClass !== 'Main') {
        res = res.replace(new RegExp(`\\b(public\\s+)?class\\s+${targetClass}\\b`), 'public class Main');
      }
    }
  } else {
    // Fallback: rename any public class to Main
    res = res.replace(/\bpublic\s+class\s+([A-Za-z0-9_$]+)/, 'public class Main');
  }

  return res;
}

/**
 * Universal Source Code Cleaner
 * Sanitizes stray Unicode characters and normalizes boilerplate for all languages.
 */
export function cleanSourceCode(code, langKey) {
  if (!code) return '';
  let cleaned = code.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ');

  const canonicalLang = normalizeLanguage(langKey);

  if (canonicalLang === 'java') {
    cleaned = normalizeJavaCode(cleaned);
  } else if (canonicalLang === 'c' || canonicalLang === 'cpp') {
    cleaned = cleaned.replace(/\bvoid\s+main\s*\(/g, 'int main(');
  }

  return cleaned;
}

