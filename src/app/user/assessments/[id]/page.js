'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Check, 
  X, 
  HelpCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const ASSESSMENTS_DATA = {
  'ass-1': {
    title: "Data Structures Fundamentals",
    category: "Data Structures",
    durationMinutes: 20,
    points: 100,
    questions: [
      {
        id: 1,
        question: "What is the average time complexity of searching for an element in a Hash Table with good distribution?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correctIndex: 0,
        explanation: "Hash tables provide average O(1) constant time lookups by hashing the key directly to a bucket."
      },
      {
        id: 2,
        question: "Which data structure follows the First-In, First-Out (FIFO) principle?",
        options: ["Stack", "Queue", "Binary Search Tree", "Max Heap"],
        correctIndex: 1,
        explanation: "A Queue operates on the First-In, First-Out (FIFO) principle, where elements inserted first are removed first."
      },
      {
        id: 3,
        question: "What is the maximum number of children a node can have in a Binary Tree?",
        options: ["1", "2", "3", "Unlimited"],
        correctIndex: 1,
        explanation: "By definition, each node in a binary tree can have at most 2 children (left and right)."
      },
      {
        id: 4,
        question: "Which of the following data structures is typically used to implement recursion iteratively?",
        options: ["Queue", "Stack", "Priority Queue", "Deque"],
        correctIndex: 1,
        explanation: "A Stack represents the system call stack used in recursion, allowing explicit simulation of recursive calls."
      },
      {
        id: 5,
        question: "In a Singly Linked List, what is the time complexity of inserting a node at the head (beginning)?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctIndex: 0,
        explanation: "Inserting at the head takes O(1) constant time since we only update the newNode.next pointer and the head pointer."
      },
      {
        id: 6,
        question: "Which tree traversal visits nodes in the order: Left, Root, Right?",
        options: ["Pre-order", "In-order", "Post-order", "Level-order"],
        correctIndex: 1,
        explanation: "In-order traversal visits the left subtree, then the root node, and finally the right subtree. In a BST, it produces sorted order."
      }
    ]
  },
  'ass-2': {
    title: "Advanced Algorithms",
    category: "Algorithms",
    durationMinutes: 30,
    points: 200,
    questions: [
      {
        id: 1,
        question: "What is the worst-case time complexity of standard QuickSort with poor pivot selection?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(2ⁿ)"],
        correctIndex: 1,
        explanation: "When the selected pivot is repeatedly the extreme element (e.g. on already sorted arrays without randomization), QuickSort degrades to O(n²)."
      },
      {
        id: 2,
        question: "Dijkstra's algorithm cannot handle graphs containing which of the following?",
        options: ["Directed edges", "Cycles", "Negative edge weights", "Disconnected nodes"],
        correctIndex: 2,
        explanation: "Dijkstra's algorithm assumes edge weights are non-negative. For negative edge weights, Bellman-Ford algorithm must be used."
      },
      {
        id: 3,
        question: "Which algorithmic paradigm does the Floyd-Warshall algorithm use for all-pairs shortest paths?",
        options: ["Greedy Method", "Dynamic Programming", "Backtracking", "Divide and Conquer"],
        correctIndex: 1,
        explanation: "Floyd-Warshall builds the solution by iterating over intermediate vertices using Dynamic Programming in O(V³)."
      },
      {
        id: 4,
        question: "What is the time complexity of finding an element using Binary Search on a sorted array of size n?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
        correctIndex: 1,
        explanation: "Binary Search halves the search space each step, yielding logarithmic O(log n) time complexity."
      }
    ]
  },
  'ass-3': {
    title: "JavaScript Basics & Modern ES6+",
    category: "Web Development",
    durationMinutes: 15,
    points: 50,
    questions: [
      {
        id: 1,
        question: "What is the output of `typeof null` in standard JavaScript?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correctIndex: 2,
        explanation: "`typeof null` evaluates to 'object' due to a historical legacy bug in the original JavaScript implementation."
      },
      {
        id: 2,
        question: "Which keyword defines a block-scoped variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        correctIndex: 2,
        explanation: "`const` defines block-scoped identifiers that cannot be reassigned after declaration."
      },
      {
        id: 3,
        question: "What does `Promise.all()` do if one of the promises in the array rejects?",
        options: [
          "Waits for the rest to finish and resolves",
          "Immediately rejects with the reason of the first rejected promise",
          "Returns null",
          "Retries the rejected promise automatically"
        ],
        correctIndex: 1,
        explanation: "Promise.all() is fail-fast: if any promise rejects, the entire returned promise immediately rejects with that error."
      },
      {
        id: 4,
        question: "Which array method creates a new array with all elements that pass a test condition?",
        options: ["map()", "filter()", "reduce()", "forEach()"],
        correctIndex: 1,
        explanation: "`filter()` iterates over an array and returns a new array with only elements that return truthy for the callback."
      }
    ]
  }
};

export default function AssessmentTakePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id || 'ass-1';
  const assessment = ASSESSMENTS_DATA[id] || ASSESSMENTS_DATA['ass-1'];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(assessment.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreReport, setScoreReport] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, isSubmitted]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitTest = async () => {
    let correctCount = 0;
    assessment.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const total = assessment.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const earnedPoints = Math.round((correctCount / total) * assessment.points);

    // Save earned points to localStorage & database
    const currentPoints = parseInt(localStorage.getItem('nextgen-user-points') || '0', 10);
    localStorage.setItem('nextgen-user-points', String(currentPoints + earnedPoints));

    const report = {
      correctCount,
      total,
      percentage,
      earnedPoints,
      passed: percentage >= 60
    };

    setScoreReport(report);
    setIsSubmitted(true);

    // Attempt to persist to user stats
    const userId = localStorage.getItem('nextgen-user-id');
    if (userId) {
      try {
        await fetch('/api/user/submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            problemId: id,
            language: 'assessment',
            code: JSON.stringify(selectedAnswers),
            status: report.passed ? 'Passed Assessment' : 'Failed Assessment',
            executionTimeMs: (assessment.durationMinutes * 60) - secondsRemaining,
            pointsEarned: earnedPoints
          })
        });
      } catch (e) {}
    }
  };

  const currentQ = assessment.questions[currentIdx];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navbar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            href="/user/assessments" 
            className="p-2 bg-zinc-950 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{assessment.category}</span>
            <h1 className="text-xl font-bold text-zinc-50">{assessment.title}</h1>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="flex items-center gap-4">
            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
              secondsRemaining < 300 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                : 'bg-zinc-950 text-emerald-400 border-zinc-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              Submit Assessment
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
            <Link
              href="/user/assessments"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Return to Catalog
            </Link>
          </div>
        )}
      </div>

      {/* Main Examination View */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Box (3 cols) */}
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
                <span className="text-xs font-mono font-bold text-zinc-400">
                  Question {currentIdx + 1} of {assessment.questions.length}
                </span>
                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    flagged[currentQ.id]
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag for review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-lg md:text-xl font-bold text-zinc-50 leading-relaxed mb-8">
                {currentQ.question}
              </h2>

              {/* Options list */}
              <div className="space-y-3">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono border ${
                          isSelected 
                            ? 'bg-violet-600 text-white border-violet-500' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-zinc-800">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer border border-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs text-zinc-500 font-mono">
                {Object.keys(selectedAnswers).length} answered
              </div>

              <button
                disabled={currentIdx === assessment.questions.length - 1}
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer shadow-md shadow-violet-600/20"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Question Palette */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Question Palette
            </h3>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {assessment.questions.map((q, idx) => {
                const isCurrent = currentIdx === idx;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isFlagged = flagged[q.id];

                let btnStyle = "bg-zinc-950 text-zinc-400 border-zinc-800";
                if (isCurrent) {
                  btnStyle = "ring-2 ring-violet-500 text-white bg-violet-600/30 border-violet-500";
                } else if (isFlagged) {
                  btnStyle = "bg-amber-500/20 text-amber-300 border-amber-500/40";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl font-bold font-mono text-xs border transition-all cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span>
                <span>Flagged for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-zinc-950 border border-zinc-800"></span>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Score Report & Detailed Review Screen */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg ${
                  scoreReport.passed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20'
                }`}>
                  {scoreReport.percentage}%
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-50">
                    {scoreReport.passed ? 'Assessment Passed! 🎉' : 'Assessment Completed'}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    You answered {scoreReport.correctCount} of {scoreReport.total} questions correctly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center min-w-[120px]">
                  <p className="text-xs text-zinc-500 mb-1 font-mono uppercase">Points Earned</p>
                  <p className="text-2xl font-bold text-amber-400 font-mono">+{scoreReport.earnedPoints}</p>
                </div>
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center min-w-[120px]">
                  <p className="text-xs text-zinc-500 mb-1 font-mono uppercase">Accuracy</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">{scoreReport.percentage}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions & Explanations Review */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" /> Question-by-Question Review
            </h3>

            <div className="space-y-6">
              {assessment.questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div key={q.id} className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-500">Q{idx + 1}.</span>
                        <h4 className="font-semibold text-zinc-200 text-sm">{q.question}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${
                        isCorrect 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {isCorrect ? 'Correct' : userAns === undefined ? 'Unanswered' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        let optStyle = "bg-zinc-900 text-zinc-400 border-zinc-800";
                        if (optIdx === q.correctIndex) {
                          optStyle = "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold";
                        } else if (optIdx === userAns && !isCorrect) {
                          optStyle = "bg-rose-500/10 text-rose-300 border-rose-500/40 line-through";
                        }

                        return (
                          <div key={optIdx} className={`p-3 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}>
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {optIdx === q.correctIndex && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {optIdx === userAns && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 text-xs text-zinc-400">
                      <strong className="text-violet-300">Explanation: </strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
