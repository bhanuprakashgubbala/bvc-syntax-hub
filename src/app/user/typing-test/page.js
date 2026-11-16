"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Keyboard, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Award, 
  Flame, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock,
  Code2
} from "lucide-react";
import Link from "next/link";

const SNIPPETS = {
  Python: [
    `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
    `def fibonacci(n):\n    if n <= 1:\n        return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i - 1] + dp[i - 2]\n    return dp[n]`
  ],
  JavaScript: [
    `const fetchUserData = async (userId) => {\n  try {\n    const response = await fetch(\`/api/user/\${userId}\`);\n    if (!response.ok) throw new Error("Fetch failed");\n    const data = await response.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n};`,
    `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}`
  ],
  "C++": [
    `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {1, 2, 3, 4, 5};\n    for (int num : nums) {\n        cout << num * 2 << " ";\n    }\n    return 0;\n}`,
  ]
};

export default function TypingTestPage() {
  const [lang, setLang] = useState("Python");
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [duration, setDuration] = useState(60); // 30, 60, 120 seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const snippet = SNIPPETS[lang]?.[snippetIndex] || SNIPPETS["Python"][0];
  const [typedInput, setTypedInput] = useState("");
  const inputRef = useRef(null);

  // Play synthetic mechanical click sound
  const playClickSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  };

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTest = () => {
    setTypedInput("");
    setTimeLeft(duration);
    setIsActive(true);
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const endTest = () => {
    setIsActive(false);
    setIsFinished(true);

    // Calculate and save best score
    const wpm = calculateWPM();
    const currentBest = parseInt(localStorage.getItem("nextgen-best-wpm") || "0", 10);
    if (wpm > currentBest) {
      localStorage.setItem("nextgen-best-wpm", String(wpm));
    }
  };

  const resetTest = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setTypedInput("");
  };

  const handleInputChange = (e) => {
    if (!isActive && !isFinished) {
      setIsActive(true);
    }
    const val = e.target.value;
    setTypedInput(val);
    playClickSound();

    if (val.length >= snippet.length) {
      endTest();
    }
  };

  // Metrics calculation
  let correctChars = 0;
  for (let i = 0; i < typedInput.length; i++) {
    if (typedInput[i] === snippet[i]) correctChars++;
  }
  const totalChars = typedInput.length;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  
  const calculateWPM = () => {
    const elapsedSeconds = Math.max(1, duration - timeLeft);
    const words = correctChars / 5;
    const minutes = elapsedSeconds / 60;
    return Math.round(words / minutes);
  };

  const currentWpm = calculateWPM();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Keyboard className="w-6 h-6 text-violet-400" />
              Code Typing Speed Arena
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Test and improve your programming syntax typing speed and precision.</p>
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute Mechanical Clicks" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Language Selector */}
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              resetTest();
            }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            {Object.keys(SNIPPETS).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {/* Duration Selector */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            {[30, 60, 120].map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setDuration(sec);
                  setTimeLeft(sec);
                  resetTest();
                }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  duration === sec ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Dashboard HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Typing Speed</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-bold font-mono text-violet-400">{currentWpm}</span>
            <span className="text-xs text-zinc-500 font-mono">WPM</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Accuracy</p>
          <div className="flex items-center justify-center gap-1">
            <span className={`text-3xl font-bold font-mono ${accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Time Left</p>
          <div className="flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-3xl font-bold font-mono text-cyan-400">{timeLeft}s</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Personal Best</p>
          <div className="flex items-center justify-center gap-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-3xl font-bold font-mono text-amber-400">
              {typeof window !== "undefined" ? localStorage.getItem("nextgen-best-wpm") || "0" : "0"} WPM
            </span>
          </div>
        </div>
      </div>

      {/* Typing Canvas Box */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 rounded-2xl p-6 md:p-8 relative cursor-text transition-all shadow-inner overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-violet-400" /> {lang} Snippet #{snippetIndex + 1}</span>
          <span>Click text to focus and type</span>
        </div>

        {/* Character By Character Rendering */}
        <div className="font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap select-none min-h-[160px]">
          {snippet.split("").map((char, index) => {
            const isTyped = index < typedInput.length;
            const isCorrect = isTyped && typedInput[index] === char;
            const isCurrent = index === typedInput.length;

            let charColor = "text-zinc-600";
            if (isTyped) {
              charColor = isCorrect ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/20";
            }

            return (
              <span
                key={index}
                className={`${charColor} ${isCurrent ? 'border-b-2 border-violet-400 animate-pulse text-white font-bold' : ''}`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden Input field for capturing key strokes */}
        <input
          ref={inputRef}
          type="text"
          value={typedInput}
          onChange={handleInputChange}
          disabled={isFinished}
          className="absolute -top-40 left-0 opacity-0"
          autoFocus
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {!isActive && !isFinished ? (
          <button
            onClick={startTest}
            className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Start Typing Test
          </button>
        ) : (
          <button
            onClick={resetTest}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset / Try Another
          </button>
        )}
      </div>

      {/* Finish Stats Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-violet-500/40 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            <div className="w-16 h-16 bg-violet-500/20 border border-violet-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-50 mb-1">Test Completed!</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Great session! Keep practicing code syntax to build developer muscle memory.
            </p>

            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
              <div>
                <p className="text-[11px] text-zinc-500 font-mono">Speed</p>
                <p className="text-xl font-bold text-violet-400 font-mono">{currentWpm} WPM</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 font-mono">Accuracy</p>
                <p className="text-xl font-bold text-emerald-400 font-mono">{accuracy}%</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 font-mono">Points</p>
                <p className="text-xl font-bold text-amber-400 font-mono">+{currentWpm >= 30 ? 20 : 5}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetTest}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-violet-600/30 cursor-pointer"
              >
                Test Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
