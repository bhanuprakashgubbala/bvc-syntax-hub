"use client";

import { useState } from "react";
import { 
  Code2, 
  ArrowLeft, 
  Sparkles, 
  Bug, 
  Zap, 
  CheckCircle2, 
  Copy, 
  RotateCcw,
  Bot,
  Terminal,
  Send
} from "lucide-react";
import Link from "next/link";

export default function CodexPage() {
  const [inputCode, setInputCode] = useState(
`function findDuplicates(arr) {
  let duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}`
  );

  const [mode, setMode] = useState("optimize"); // 'optimize' | 'bugs' | 'explain' | 'refactor'
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleRunAiAnalysis = () => {
    setIsProcessing(true);
    setAiOutput(null);

    setTimeout(() => {
      let result = {};

      if (mode === "optimize") {
        result = {
          title: "Complexity Optimization Engine",
          summary: "Current implementation has O(n²) time complexity due to nested loops and an additional O(n) lookup via `includes()`, yielding O(n³) worst case.",
          recommendation: "Use a Hash Set or Hash Map to track seen elements in O(n) linear time.",
          improvedCode: 
`function findDuplicatesOptimized(arr) {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return Array.from(duplicates);
}`,
          timeComplexity: "O(n) Linear Time",
          spaceComplexity: "O(n) Extra Space"
        };
      } else if (mode === "bugs") {
        result = {
          title: "Security & Bug Audit Report",
          summary: "No catastrophic memory leaks detected, but potential quadratic freeze on large input arrays (>100,000 items).",
          recommendation: "Ensure array input is validated against null / undefined to avoid `TypeError: Cannot read properties of undefined`.",
          improvedCode: 
`function findDuplicatesSafe(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const res = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (seen.has(arr[i])) res.add(arr[i]);
    else seen.add(arr[i]);
  }
  return [...res];
}`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)"
        };
      } else if (mode === "explain") {
        result = {
          title: "Algorithmic Code Walkthrough",
          summary: "1. The function initializes an empty `duplicates` array.\n2. The outer loop traverses each item at index `i`.\n3. The inner loop compares `arr[i]` with all subsequent elements at index `j`.\n4. When a duplicate is encountered, it checks `!duplicates.includes()` to prevent repeated pushes.",
          recommendation: "Good for small inputs, but inefficient for competitive programming datasets.",
          improvedCode: `// Documented code pattern:\n// Suitable for small inputs (n < 500)`,
          timeComplexity: "O(n²)",
          spaceComplexity: "O(n)"
        };
      } else {
        result = {
          title: "Modern ES6+ Refactored Code",
          summary: "Refactored using functional programming paradigms with Set lookups.",
          recommendation: "Provides clean, declarative, production-grade readability.",
          improvedCode: 
`const findDuplicates = (arr) => {
  const seen = new Set();
  return [...new Set(arr.filter(item => seen.has(item) ? true : (seen.add(item), false)))];
};`,
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)"
        };
      }

      setAiOutput(result);
      setIsProcessing(false);
    }, 600);
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" />
            CodeX AI Assistant
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time intelligent code optimization, bug detection, and complexity analyzer.</p>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Code Editor */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" /> Source Code
              </span>

              {/* Mode Selector */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                {[
                  { key: "optimize", label: "Optimize", icon: Zap },
                  { key: "bugs", label: "Find Bugs", icon: Bug },
                  { key: "explain", label: "Explain", icon: Bot },
                  { key: "refactor", label: "Refactor", icon: Sparkles },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        mode === m.key
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              rows={14}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your function or algorithm code here..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-200 focus:outline-none focus:border-violet-500 leading-relaxed resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunAiAnalysis}
              disabled={isProcessing || !inputCode.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: AI Output Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4" /> CodeX Neural Insights
              </span>
              {aiOutput && (
                <button
                  onClick={() => copyCode(aiOutput.improvedCode)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Solution"}</span>
                </button>
              )}
            </div>

            {aiOutput ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{aiOutput.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap leading-relaxed">
                    {aiOutput.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="px-2.5 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg">
                    Time: {aiOutput.timeComplexity}
                  </span>
                  <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg">
                    Space: {aiOutput.spaceComplexity}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Recommended Solution:
                  </span>
                  <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                    <code>{aiOutput.improvedCode}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Bot className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-xs font-medium">Select an action (Optimize, Find Bugs, Explain) and click Execute AI Analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
