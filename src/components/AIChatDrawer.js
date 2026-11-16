"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Lightbulb,
  AlertCircle,
  Zap,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Wrench,
  FileText
} from "lucide-react";

function extractCode(text) {
  if (!text) return null;
  const match = text.match(/```(?:[a-zA-Z0-9_\-+]*\n)?([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

export default function AIChatDrawer({
  isOpen,
  onClose,
  code = "",
  language = "Python",
  problem = null,
  errorLogs = "",
  onApplyCode = null
}) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello! I am your **AI Socratic Tutor & Code Assistant**. 

I am directly connected to your **${language}** code pad! 

You can ask me questions, or use the quick actions below to **fix errors**, **optimize complexity**, or **generate comments** directly into your editor!`
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeStats, setCodeStats] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [appliedIndex, setAppliedIndex] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Initial code analysis when opening
  useEffect(() => {
    if (isOpen && code) {
      handleAnalyzeQuick();
    }
  }, [isOpen]);

  const handleAnalyzeQuick = async () => {
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemTitle: problem?.title || "Coding Challenge",
          problemDescription: problem?.description || "",
          errorLogs,
          studentDoubt: "Analyze pass percentage and complexity"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setCodeStats(data.analysis);
        }
      }
    } catch (e) {
      console.warn("Could not fetch quick analysis:", e);
    }
  };

  const handleSendMessage = async (customPrompt = null, actionType = "review") => {
    const question = customPrompt || inputMessage.trim();
    if (!question || isLoading) return;

    const userMsg = { sender: "user", text: question };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemTitle: problem?.title || "Coding Challenge",
          problemDescription: problem?.description || "",
          errorLogs,
          studentDoubt: question,
          action: actionType,
          socraticMode: actionType === "review"
        })
      });

      if (!res.ok) throw new Error("AI Tutor response error");
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "I analyzed your code. Let's look closer at your logic flow.",
          generatedCode: data.generatedCode || extractCode(data.reply),
          provider: data.provider
        }
      ]);

      if (data.analysis) {
        setCodeStats(data.analysis);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ **Professor's Notice**: I could not reach the server at this moment. 
          
Here is a quick diagnostic: verify your syntax in **${language}**, check for matched brackets, and ensure a valid return value is present.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-100 text-sm">AI Socratic Tutor</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Connected to Code Pad
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Guiding hints, auto-fix & 1-click code injection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([{
              sender: "ai",
              text: `Chat reset. What would you like to explore regarding your ${language} solution?`
            }])}
            title="Reset Chat"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Code Completion & Efficiency Meter */}
      {codeStats && (
        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Code Completion & Pass Score:
            </span>
            <span className={`font-mono font-bold text-xs ${codeStats.passPercentage >= 90 ? 'text-emerald-400' :
              codeStats.passPercentage >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
              {codeStats.passPercentage}% ({codeStats.status})
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${codeStats.passPercentage >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                codeStats.passPercentage >= 50 ? 'bg-gradient-to-r from-amber-500 to-violet-500' :
                  'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
              style={{ width: `${Math.max(codeStats.passPercentage, 5)}%` }}
            />
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span>Time: <strong className="text-zinc-200">{codeStats.metrics.estimatedTimeComplexity}</strong></span>
            <span>•</span>
            <span>Space: <strong className="text-zinc-200">{codeStats.metrics.estimatedSpaceComplexity}</strong></span>
            <span>•</span>
            <span>Lines: <strong className="text-zinc-200">{codeStats.metrics.lineCount}</strong></span>
          </div>
        </div>
      )}

      {/* Quick Prompt & Code Action Chips */}
      <div className="px-3 py-2 border-b border-zinc-800/60 bg-zinc-900/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSendMessage("Fix all errors in my code and make it run cleanly", "fix_code")}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Wrench className="w-3 h-3 text-amber-400" />
          <span>Auto-Fix Code</span>
        </button>

        <button
          onClick={() => handleSendMessage("Optimize my code for maximum time and space efficiency", "optimize_code")}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Optimize</span>
        </button>

        <button
          onClick={() => handleSendMessage("Add clear educational comments explaining every step", "add_comments")}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <FileText className="w-3 h-3 text-emerald-400" />
          <span>Add Comments</span>
        </button>

        <button
          onClick={() => handleSendMessage("Give me a Socratic hint without spoiling the code", "review")}
          disabled={isLoading}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-violet-300 border border-violet-500/20 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
        >
          <Lightbulb className="w-3 h-3 text-violet-400" />
          <span>Socratic Hint</span>
        </button>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          const codeSnippet = msg.generatedCode || extractCode(msg.text);

          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className={`max-w-[92%] rounded-2xl p-4 text-xs leading-relaxed ${isUser
                ? "bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-600/20"
                : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm"
                }`}>
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1 text-violet-400 font-bold">
                      <GraduationCap className="w-3.5 h-3.5" /> Professor
                    </span>
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="hover:text-zinc-300 transition-colors p-1"
                      title="Copy explanation"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text}
                </div>

                {/* 1-Click Apply to Code Pad Button */}
                {!isUser && codeSnippet && onApplyCode && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Code ready for editor
                    </span>
                    <button
                      onClick={() => {
                        onApplyCode(codeSnippet);
                        setAppliedIndex(index);
                        setTimeout(() => setAppliedIndex(null), 2500);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{appliedIndex === index ? "✨ Applied to Code Pad!" : "Apply to Code Pad"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-4 text-xs text-zinc-400 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
              <span>Professor is analyzing code and generating response...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Professor (e.g. Write binary search, Fix my loop)..."
          disabled={isLoading}
          className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white transition-all shadow-md shadow-violet-600/30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
