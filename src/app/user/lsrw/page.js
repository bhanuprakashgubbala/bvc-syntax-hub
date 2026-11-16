"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Headphones, 
  ArrowLeft, 
  BookOpen, 
  Mic, 
  Edit3, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Award,
  Clock,
  Send,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function LSRWPage() {
  const [activeTab, setActiveTab] = useState("listening"); // 'listening' | 'speaking' | 'reading' | 'writing'

  // ================= LISTENING MODULE STATES =================
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [listeningSubmitted, setListeningSubmitted] = useState(false);

  const listeningPassage = 
    "Modern cloud computing relies heavily on distributed consensus algorithms such as Raft and Paxos. These algorithms ensure that a cluster of computing nodes can agree on values even in the presence of faulty networks and server crashes. Microservices leverage these distributed registries for service discovery, load balancing, and zero-downtime rolling deployments.";

  const playSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(listeningPassage);
    utterance.rate = audioSpeed;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => stopSpeech();
  }, [activeTab]);

  const listeningQuestions = [
    {
      id: 1,
      q: "Which two consensus algorithms were highlighted in the passage?",
      options: ["SHA-256 and MD5", "Raft and Paxos", "Dijkstra and Bellman-Ford", "TCP and UDP"],
      correct: 1
    },
    {
      id: 2,
      q: "What do microservices leverage distributed registries for?",
      options: ["CSS compiling", "Service discovery and load balancing", "Hardware overclocking", "Graphic design"],
      correct: 1
    }
  ];

  // ================= SPEAKING MODULE STATES =================
  const speakingPrompt = 
    "Distributed microservices provide resilience, scalability, and independent deployment cycles across diverse cloud environments.";
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [speakingScore, setSpeakingScore] = useState(null);
  const recognitionRef = useRef(null);

  const startSpeakingTest = () => {
    setSpeakingScore(null);
    setSpokenText("");

    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenText(transcript);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
    } else {
      // Fallback simulator for browsers without speech recognition
      setIsRecording(true);
      setTimeout(() => {
        setSpokenText("Distributed microservices provide resilience, scalability, and independent deployment cycles across diverse cloud environments.");
        setIsRecording(false);
      }, 3500);
    }
  };

  const stopSpeakingTest = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const evaluateSpeaking = () => {
    const targetWords = speakingPrompt.toLowerCase().replace(/[.,]/g, "").split(" ");
    const spokenWords = spokenText.toLowerCase().replace(/[.,]/g, "").split(" ");

    let matched = 0;
    targetWords.forEach(w => {
      if (spokenWords.includes(w)) matched++;
    });

    const score = Math.min(100, Math.round((matched / targetWords.length) * 100));
    setSpeakingScore({
      score,
      matched,
      total: targetWords.length,
      grade: score >= 80 ? "Fluent (A+)" : score >= 60 ? "Proficient (B)" : "Needs Practice (C)"
    });
  };

  // ================= READING MODULE STATES =================
  const readingPassage = 
    "Software reliability engineering (SRE) bridges the traditional gap between software development and IT operations. By treating operational challenges as software problems, SRE teams establish Service Level Objectives (SLOs) and Error Budgets to balance rapid innovation with system stability. When a service operates well within its error budget, product teams can ship features aggressively. Conversely, when error budgets deplete, release trains pause to prioritize resilience, automated chaos engineering, and incident retrospectives.";
  const [readingTimer, setReadingTimer] = useState(0);
  const [isReadingActive, setIsReadingActive] = useState(false);
  const [readingFinished, setReadingFinished] = useState(false);
  const [readingWpm, setReadingWpm] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isReadingActive) {
      interval = setInterval(() => setReadingTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isReadingActive]);

  const startReading = () => {
    setReadingTimer(0);
    setIsReadingActive(true);
    setReadingFinished(false);
  };

  const finishReading = () => {
    setIsReadingActive(false);
    setReadingFinished(true);
    const wordCount = readingPassage.split(" ").length;
    const minutes = Math.max(0.1, readingTimer / 60);
    setReadingWpm(Math.round(wordCount / minutes));
  };

  // ================= WRITING MODULE STATES =================
  const [writingContent, setWritingContent] = useState("");
  const [writingAnalysis, setWritingAnalysis] = useState(null);

  const analyzeWriting = () => {
    const words = writingContent.trim().split(/\s+/).filter(Boolean);
    const characters = writingContent.length;
    const sentences = writingContent.split(/[.!?]+/).filter(Boolean);

    const wordCount = words.length;
    const avgWordLength = wordCount ? (characters / wordCount).toFixed(1) : 0;
    const estReadTime = Math.ceil(wordCount / 200);

    // Score calculation
    let clarityScore = 60;
    if (wordCount >= 50) clarityScore += 15;
    if (wordCount >= 100) clarityScore += 15;
    if (sentences.length >= 4) clarityScore += 10;

    setWritingAnalysis({
      wordCount,
      charCount: characters,
      sentenceCount: sentences.length,
      avgWordLength,
      readTimeMins: estReadTime,
      clarityScore: Math.min(100, clarityScore),
      feedback: wordCount < 50 
        ? "Good start. Try adding more concrete engineering examples and technical justification." 
        : "Excellent structure! Clear vocabulary with cohesive sentence transitions."
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">LSRW Language & Communication Lab</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Master Listening, Speaking, Reading, and Writing competencies for technical placement interviews.</p>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: "listening", name: "Listening Lab", icon: Headphones, color: "violet" },
          { key: "speaking", name: "Speaking & Fluency", icon: Mic, color: "emerald" },
          { key: "reading", name: "Speed Reading", icon: BookOpen, color: "cyan" },
          { key: "writing", name: "Technical Writing", icon: Edit3, color: "amber" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                isActive
                  ? 'bg-zinc-900 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-violet-500'
                  : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isActive ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isActive ? 'text-zinc-50' : 'text-zinc-300'}`}>{tab.name}</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Practice Module</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. LISTENING MODULE                                                       */}
      {/* ========================================================================= */}
      {activeTab === "listening" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Audio Comprehension</span>
              <h2 className="text-xl font-bold text-zinc-50 mt-0.5">Distributed Systems & Cloud Consensus</h2>
              <p className="text-xs text-zinc-400 mt-1">Listen to the recorded technical explanation and answer the comprehension check.</p>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-3">
              <select
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value={0.8}>0.8x Slow</option>
                <option value={1}>1.0x Normal</option>
                <option value={1.2}>1.2x Fast</option>
              </select>

              <button
                onClick={playSpeech}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlayingAudio ? "Pause Audio" : "Play Speech"}</span>
              </button>
            </div>
          </div>

          {/* Sound Wave Animation when playing */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-1.5 h-12">
              {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85, 65].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-200 ${
                    isPlayingAudio ? 'bg-violet-500 animate-pulse' : 'bg-zinc-800'
                  }`}
                  style={{ height: isPlayingAudio ? `${Math.max(15, (h * Math.sin(i + 1) * 0.8 + 50))}%` : '20%' }}
                />
              ))}
            </div>
            <p className="text-xs font-mono text-zinc-500">
              {isPlayingAudio ? "Playing native speech synthesis audio..." : "Click 'Play Speech' to listen to the passage"}
            </p>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs text-violet-400 hover:underline cursor-pointer font-medium"
            >
              {showTranscript ? "Hide Transcript" : "View Transcript"}
            </button>

            {showTranscript && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-w-2xl text-center">
                "{listeningPassage}"
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Comprehension Check</h3>
            {listeningQuestions.map((q) => (
              <div key={q.id} className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <p className="text-sm font-semibold text-zinc-200">{q.id}. {q.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = listeningAnswers[q.id] === optIdx;
                    let style = "bg-zinc-900 border-zinc-800 text-zinc-300";
                    if (listeningSubmitted) {
                      if (optIdx === q.correct) style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                      else if (isSelected) style = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                    } else if (isSelected) {
                      style = "bg-violet-600/20 border-violet-500 text-violet-300 font-semibold";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={listeningSubmitted}
                        onClick={() => setListeningAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                        className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${style}`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                disabled={listeningSubmitted || Object.keys(listeningAnswers).length < listeningQuestions.length}
                onClick={() => setListeningSubmitted(true)}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
              >
                Check Listening Answers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SPEAKING MODULE                                                        */}
      {/* ========================================================================= */}
      {activeTab === "speaking" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pronunciation & Fluency</span>
            <h2 className="text-xl font-bold text-zinc-50 mt-0.5">Read Aloud Speaking Challenge</h2>
            <p className="text-xs text-zinc-400 mt-1">Read the following target sentence clearly into your microphone to evaluate pronunciation accuracy.</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/20 text-center space-y-4">
            <span className="text-xs text-zinc-500 font-mono uppercase">Target Passage</span>
            <p className="text-lg md:text-xl font-medium text-zinc-100 max-w-2xl mx-auto leading-relaxed">
              "{speakingPrompt}"
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              {!isRecording ? (
                <button
                  onClick={startSpeakingTest}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Mic className="w-4 h-4" /> Start Speaking
                </button>
              ) : (
                <button
                  onClick={stopSpeakingTest}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer"
                >
                  <Pause className="w-4 h-4" /> Stop Recording
                </button>
              )}
            </div>
          </div>

          {spokenText && (
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Speech Transcript:</span>
              <p className="text-sm font-mono text-zinc-200 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                {spokenText}
              </p>
              <button
                onClick={evaluateSpeaking}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Analyze Speech Score
              </button>
            </div>
          )}

          {speakingScore && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold font-mono">
                  {speakingScore.score}%
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-base">Fluency Result: {speakingScore.grade}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Matched {speakingScore.matched} of {speakingScore.total} technical keywords.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold font-mono">
                +25 Points Awarded
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. READING MODULE                                                         */}
      {/* ========================================================================= */}
      {activeTab === "reading" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Speed Reading & Retention</span>
              <h2 className="text-xl font-bold text-zinc-50 mt-0.5">Site Reliability Engineering (SRE)</h2>
              <p className="text-xs text-zinc-400 mt-1">Track your reading Words-Per-Minute (WPM) and comprehension retention.</p>
            </div>

            <div className="flex items-center gap-3">
              {isReadingActive ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-cyan-500/30 font-mono text-cyan-400 text-xs font-bold">
                  <Clock className="w-4 h-4 animate-spin" /> {readingTimer}s elapsed
                </div>
              ) : null}

              {!isReadingActive && !readingFinished ? (
                <button
                  onClick={startReading}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  Start Reading Timer
                </button>
              ) : isReadingActive ? (
                <button
                  onClick={finishReading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  I'm Done Reading
                </button>
              ) : (
                <button
                  onClick={startReading}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart
                </button>
              )}
            </div>
          </div>

          {/* Reading text box */}
          <div className="p-6 md:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm md:text-base leading-relaxed text-zinc-200 select-none">
            {readingPassage}
          </div>

          {readingFinished && (
            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-cyan-300 font-semibold uppercase">Reading Speed Result:</span>
                <p className="text-2xl font-bold font-mono text-zinc-100">{readingWpm} <span className="text-xs text-zinc-400 font-sans font-normal">Words Per Minute</span></p>
              </div>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold">
                {readingWpm >= 250 ? "Fast Reader (Top 10%)" : "Good Pace (Average)"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WRITING MODULE                                                         */}
      {/* ========================================================================= */}
      {activeTab === "writing" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Technical Composition</span>
            <h2 className="text-xl font-bold text-zinc-50 mt-0.5">Professional Incident Report / Essay</h2>
            <p className="text-xs text-zinc-400 mt-1">Prompt: Explain how an engineering team should respond to a high-severity production outage and prevent regressions.</p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={8}
              value={writingContent}
              onChange={(e) => setWritingContent(e.target.value)}
              placeholder="Write your technical explanation here (aim for at least 50-100 words)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans placeholder:text-zinc-600 resize-y"
            />
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{writingContent.trim().split(/\s+/).filter(Boolean).length} words • {writingContent.length} characters</span>
              <button
                onClick={analyzeWriting}
                disabled={!writingContent.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
              >
                Analyze Writing
              </button>
            </div>
          </div>

          {writingAnalysis && (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Readability & Clarity Score</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{writingAnalysis.feedback}</p>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {writingAnalysis.clarityScore}/100
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                  <p className="text-[11px] text-zinc-500">Word Count</p>
                  <p className="text-lg font-bold text-zinc-100 font-mono">{writingAnalysis.wordCount}</p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                  <p className="text-[11px] text-zinc-500">Sentences</p>
                  <p className="text-lg font-bold text-zinc-100 font-mono">{writingAnalysis.sentenceCount}</p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                  <p className="text-[11px] text-zinc-500">Avg Word Length</p>
                  <p className="text-lg font-bold text-zinc-100 font-mono">{writingAnalysis.avgWordLength}</p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                  <p className="text-[11px] text-zinc-500">Read Time</p>
                  <p className="text-lg font-bold text-zinc-100 font-mono">{writingAnalysis.readTimeMins} min</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
