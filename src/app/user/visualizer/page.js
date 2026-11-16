"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Info,
  SkipForward,
  X
} from "lucide-react";
import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";

const ALGORITHMS = {
  bubbleSort: {
    name: "Bubble Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    youtubeId: "xli_FI7CuzA"
  },
  insertionSort: {
    name: "Insertion Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description: "Builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into the sorted portion.",
    youtubeId: "OGzPmgsI-pQ"
  },
  mergeSort: {
    name: "Merge Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description: "Divide-and-conquer algorithm that divides the input array into two halves, recursively sorts them, and merges them back.",
    youtubeId: "4VqmGXwpLqc"
  },
  quickSort: {
    name: "Quick Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)",
    description: "Picks an element as pivot and partitions the array around the picked pivot, placing elements smaller than pivot to left.",
    youtubeId: "Hoixgm4-P4M"
  }
};

export default function VisualizerPage() {
  const [selectedAlgo, setSelectedAlgo] = useState("bubbleSort");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [arraySize, setArraySize] = useState(16);
  const [speed, setSpeed] = useState(50); // Delay in ms: lower = faster
  const [array, setArray] = useState([]);
  const [comparing, setComparing] = useState([]); // indices being compared
  const [swapping, setSwapping] = useState([]); // indices being swapped
  const [sortedIndices, setSortedIndices] = useState([]); // indices fully sorted
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [explanation, setExplanation] = useState("Press 'Start Visualization' to begin algorithm execution.");

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);

  // Generate random array
  const generateRandomArray = (size = arraySize) => {
    cancelRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    setComparing([]);
    setSwapping([]);
    setSortedIndices([]);
    setComparisons(0);
    setSwaps(0);
    setExplanation("Array randomized. Choose an algorithm and press Play.");

    const newArr = [];
    for (let i = 0; i < size; i++) {
      newArr.push(Math.floor(Math.random() * 85) + 15);
    }
    setArray(newArr);
  };

  useEffect(() => {
    generateRandomArray(arraySize);
  }, [arraySize]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkPauseOrCancel = async () => {
    while (pauseRef.current) {
      if (cancelRef.current) return true;
      await sleep(100);
    }
    return cancelRef.current;
  };

  // 1. Bubble Sort
  const runBubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    let compCount = 0;
    let swapCount = 0;
    const sorted = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (await checkPauseOrCancel()) return;

        setComparing([j, j + 1]);
        compCount++;
        setComparisons(compCount);
        setExplanation(`Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          swapCount++;
          setSwaps(swapCount);
          setExplanation(`Swapping ${arr[j]} and ${arr[j + 1]} because ${arr[j]} > ${arr[j + 1]}`);
          
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
          await sleep(speed);
        }
        setSwapping([]);
      }
      sorted.push(n - i - 1);
      setSortedIndices([...sorted]);
    }
    sorted.push(0);
    setSortedIndices([...sorted]);
    setComparing([]);
    setExplanation(`Sorting Complete! Total Comparisons: ${compCount}, Swaps: ${swapCount}`);
  };

  // 2. Insertion Sort
  const runInsertionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    let compCount = 0;
    let swapCount = 0;
    const sorted = [0];
    setSortedIndices([0]);

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      setComparing([i, j]);
      setExplanation(`Evaluating key ${key} at index ${i}`);
      await sleep(speed);

      while (j >= 0 && arr[j] > key) {
        if (await checkPauseOrCancel()) return;
        compCount++;
        setComparisons(compCount);
        setComparing([j, j + 1]);
        setSwapping([j, j + 1]);

        arr[j + 1] = arr[j];
        setArray([...arr]);
        swapCount++;
        setSwaps(swapCount);
        setExplanation(`Shifting ${arr[j]} rightwards`);
        await sleep(speed);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSwapping([]);
      sorted.push(i);
      setSortedIndices([...sorted]);
    }
    setComparing([]);
    setSortedIndices(arr.map((_, idx) => idx));
    setExplanation(`Sorting Complete! Total Comparisons: ${compCount}, Operations: ${swapCount}`);
  };

  const handleStart = async () => {
    if (isPaused) {
      pauseRef.current = false;
      setIsPaused(false);
      return;
    }

    cancelRef.current = false;
    pauseRef.current = false;
    setIsRunning(true);
    setSortedIndices([]);
    setComparisons(0);
    setSwaps(0);

    if (selectedAlgo === "bubbleSort") {
      await runBubbleSort();
    } else if (selectedAlgo === "insertionSort") {
      await runInsertionSort();
    } else {
      await runBubbleSort(); // Fallback
    }

    setIsRunning(false);
    setIsPaused(false);
  };

  const handlePause = () => {
    pauseRef.current = true;
    setIsPaused(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Zap className="w-6 h-6 text-violet-400" />
              DSA Algorithm Visualizer
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Observe real-time memory comparisons, swaps, and time complexities.</p>
          </div>
        </div>

        {/* Algorithm selector pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          {Object.keys(ALGORITHMS).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedAlgo(key);
                generateRandomArray();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedAlgo === key
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {ALGORITHMS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        {/* Stage Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-zinc-50">{ALGORITHMS[selectedAlgo].name}</h2>
              <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-mono font-bold">
                Time: {ALGORITHMS[selectedAlgo].timeComplexity}
              </span>
              <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-mono font-bold">
                Space: {ALGORITHMS[selectedAlgo].spaceComplexity}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">{ALGORITHMS[selectedAlgo].description}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Watch Lecture</span>
            </button>
            <div className="text-right">
              <p className="text-[11px] text-zinc-500 uppercase font-mono">Comparisons</p>
              <p className="text-xl font-bold text-amber-400 font-mono">{comparisons}</p>
            </div>
            <div className="w-px h-8 bg-zinc-800"></div>
            <div className="text-right">
              <p className="text-[11px] text-zinc-500 uppercase font-mono">Swaps</p>
              <p className="text-xl font-bold text-rose-400 font-mono">{swaps}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Bars Canvas */}
        <div className="h-72 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-end justify-center gap-1 sm:gap-2 relative overflow-hidden shadow-inner">
          {array.map((val, idx) => {
            const isComparing = comparing.includes(idx);
            const isSwapping = swapping.includes(idx);
            const isSorted = sortedIndices.includes(idx);

            let barColor = "bg-violet-600/80 hover:bg-violet-500";
            if (isSwapping) barColor = "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse";
            else if (isComparing) barColor = "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.7)]";
            else if (isSorted) barColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";

            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 max-w-[40px] transition-all duration-150"
                style={{ height: `${val}%` }}
              >
                <div className={`w-full h-full rounded-t-md transition-colors ${barColor}`} />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 hidden sm:block">
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Step Narration Box */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-3">
          <Info className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="truncate">{explanation}</span>
        </div>

        {/* Control Deck */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          {/* Sliders */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">Elements:</span>
              <input
                type="range"
                min={8}
                max={30}
                value={arraySize}
                disabled={isRunning}
                onChange={(e) => setArraySize(parseInt(e.target.value, 10))}
                className="accent-violet-500 cursor-pointer w-28"
              />
              <span className="text-xs font-mono text-zinc-300 w-6">{arraySize}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">Speed:</span>
              <input
                type="range"
                min={10}
                max={200}
                value={210 - speed}
                onChange={(e) => setSpeed(210 - parseInt(e.target.value, 10))}
                className="accent-violet-500 cursor-pointer w-28"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => generateRandomArray()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Randomize
            </button>

            {!isRunning || isPaused ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? "Resume" : "Start Visualization"}</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/30 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded YouTube Video Lecture Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-zinc-50 text-base">
                  {ALGORITHMS[selectedAlgo].name} Masterclass Video
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1.5 rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video border border-zinc-800 shadow-xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${ALGORITHMS[selectedAlgo].youtubeId}?autoplay=1&rel=0`}
                title={`${ALGORITHMS[selectedAlgo].name} Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Time Complexity: <strong className="text-amber-400 font-mono">{ALGORITHMS[selectedAlgo].timeComplexity}</strong></span>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-semibold cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
