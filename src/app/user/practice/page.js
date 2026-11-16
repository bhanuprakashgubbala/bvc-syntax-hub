"use client";

import { useState } from "react";
import { 
  Target, 
  ArrowLeft, 
  Code2, 
  Database, 
  Laptop, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Award,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X
} from "lucide-react";
import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";

const PRACTICE_TOPICS = [
  {
    id: "ds",
    title: "Data Structures",
    icon: Database,
    color: "violet",
    youtubeId: "RBSGKlAvoiM",
    videoTitle: "Data Structures & Algorithms - Full Computer Science Course",
    questions: [
      {
        q: "Which data structure uses LIFO (Last-In First-Out)?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correct: 1,
        explanation: "Stacks operate on Last-In First-Out. The most recently pushed item is popped first."
      },
      {
        q: "What is the worst-case lookup time in an unbalanced Binary Search Tree?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correct: 2,
        explanation: "When skewed into a linked list line, BST search degrades to O(n)."
      },
      {
        q: "Which hashing collision resolution technique uses linked lists for identical hash buckets?",
        options: ["Open Addressing", "Separate Chaining", "Linear Probing", "Double Hashing"],
        correct: 1,
        explanation: "Separate Chaining stores colliding elements in a linked list attached to each bucket."
      }
    ]
  },
  {
    id: "algo",
    title: "Algorithms & Complexity",
    icon: Code2,
    color: "emerald",
    youtubeId: "0IAPZzGSbME",
    videoTitle: "Algorithms Analysis & Asymptotic Complexity In-Depth",
    questions: [
      {
        q: "What is the time complexity of Merge Sort in the worst case?",
        options: ["O(n log n)", "O(n²)", "O(log n)", "O(n)"],
        correct: 0,
        explanation: "Merge Sort consistently divides the array and merges in O(n log n) across all cases."
      },
      {
        q: "Which algorithm finds the Minimum Spanning Tree of a connected, undirected graph?",
        options: ["Kruskal's Algorithm", "Dijkstra's Algorithm", "Bellman-Ford", "Floyd-Warshall"],
        correct: 0,
        explanation: "Kruskal's and Prim's are standard algorithms for finding Minimum Spanning Trees."
      }
    ]
  },
  {
    id: "sys",
    title: "System Design",
    icon: Laptop,
    color: "cyan",
    youtubeId: "m8Icp_Cid5o",
    videoTitle: "System Design for Beginners - Scalable Distributed Architectures",
    questions: [
      {
        q: "Which caching strategy writes data to cache and primary storage at the exact same time?",
        options: ["Write-Through", "Write-Back", "Write-Around", "Read-Through"],
        correct: 0,
        explanation: "Write-Through ensures cache and database consistency by writing to both synchronously."
      },
      {
        q: "According to the CAP theorem, what does a distributed system trade off in the presence of network partition?",
        options: ["Consistency vs Availability", "Cost vs Speed", "Security vs Privacy", "CPU vs Memory"],
        correct: 0,
        explanation: "Under network partition (P), a distributed system must choose between Consistency (C) and Availability (A)."
      }
    ]
  },
  {
    id: "sec",
    title: "Cybersecurity & PenTest",
    icon: Shield,
    color: "rose",
    youtubeId: "WnN6dbos5u8",
    videoTitle: "Ethical Hacking & Web Penetration Testing Masterclass",
    questions: [
      {
        q: "Which vulnerability occurs when user input is rendered directly into HTML without sanitization?",
        options: ["Cross-Site Scripting (XSS)", "SQL Injection", "CSRF", "Buffer Overflow"],
        correct: 0,
        explanation: "XSS allows malicious scripts to execute in victims' browsers via unescaped input."
      },
      {
        q: "What is the primary countermeasure against SQL Injection in modern backends?",
        options: ["Parameterized Queries / Prepared Statements", "Base64 Encoding", "Client-side Regex", "IP Whitelisting"],
        correct: 0,
        explanation: "Prepared statements treat user input strictly as data parameters rather than executable SQL commands."
      }
    ]
  }
];

export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeVideoTopic, setActiveVideoTopic] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const activeTopic = PRACTICE_TOPICS.find(t => t.id === selectedTopic);
  const currentQ = activeTopic?.questions[currentQIndex];

  const handleSelectAnswer = (idx) => {
    if (showAnswer) return;
    setSelectedOpt(idx);
    setShowAnswer(true);

    if (idx === currentQ.correct) {
      setStreak(s => s + 1);
      setScore(sc => sc + 10);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setShowAnswer(false);
    if (currentQIndex < activeTopic.questions.length - 1) {
      setCurrentQIndex(i => i + 1);
    } else {
      // Completed topic
      setCurrentQIndex(0);
      setSelectedTopic(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Target className="w-6 h-6 text-violet-400" />
              Practice Arenas
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Rapid-fire topic drills to sharpen interview readiness.</p>
          </div>
        </div>

        {/* Streak HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-amber-400 shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400/20" /> Streak: {streak}
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-emerald-400 shadow-sm">
            <Award className="w-4 h-4" /> Score: {score}
          </div>
        </div>
      </div>

      {!selectedTopic ? (
        /* Topic Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRACTICE_TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  setCurrentQIndex(0);
                  setSelectedOpt(null);
                  setShowAnswer(false);
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-zinc-50 text-base mb-1">{topic.title}</h3>
                  <p className="text-xs text-zinc-400">{topic.questions.length} Challenges Available</p>
                </div>

                <div className="space-y-3 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoTopic(topic);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
                  >
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>Watch Video Guide</span>
                  </button>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-violet-400 font-semibold group-hover:text-violet-300">
                    <span>Start Practice Drill</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Practice Drill Session */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Topic
              </button>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{activeTopic.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveVideoTopic(activeTopic)}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Video Tutorial</span>
              </button>
              <span className="text-xs font-mono text-zinc-500">
                Question {currentQIndex + 1} of {activeTopic.questions.length}
              </span>
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-zinc-50 leading-relaxed">
            {currentQ.q}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let style = "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900";
              if (showAnswer) {
                if (idx === currentQ.correct) {
                  style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                } else if (idx === selectedOpt) {
                  style = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={showAnswer}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full p-4 rounded-xl border text-sm text-left transition-all cursor-pointer flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold font-mono text-zinc-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {showAnswer && idx === currentQ.correct && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {showAnswer && idx === selectedOpt && idx !== currentQ.correct && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-violet-300">Explanation: </strong> {currentQ.explanation}
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
              >
                {currentQIndex < activeTopic.questions.length - 1 ? "Next Challenge" : "Complete Topic Drill"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Embedded YouTube Video Lecture Modal */}
      {activeVideoTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-zinc-50 text-base">
                  {activeVideoTopic.title}: {activeVideoTopic.videoTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoTopic(null)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1.5 rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video border border-zinc-800 shadow-xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideoTopic.youtubeId}?autoplay=1&rel=0`}
                title={`${activeVideoTopic.title} Video Guide`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Master the theoretical fundamentals before testing your interview readiness.</span>
              <button
                onClick={() => setActiveVideoTopic(null)}
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
