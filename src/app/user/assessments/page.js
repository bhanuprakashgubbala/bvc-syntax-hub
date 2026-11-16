"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Clock, Play, Brain, Target, Award, Search, Sparkles, CheckCircle2, X } from "lucide-react";
import { Youtube } from "@/components/YoutubeIcon";

export default function AssessmentsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [prepVideo, setPrepVideo] = useState(null);

  const assessments = [
    {
      id: "ass-1",
      title: "Data Structures Fundamentals",
      category: "mock",
      difficulty: "Medium",
      questions: 6,
      duration: "20 mins",
      points: 100,
      description: "Hash tables, Trees, Queues, Stacks, Linked Lists and asymptotic notations.",
      youtubeId: "RBSGKlAvoiM",
      videoTitle: "Data Structures Crash Course & Assessment Prep"
    },
    {
      id: "ass-2",
      title: "Advanced Algorithms",
      category: "cert",
      difficulty: "Hard",
      questions: 4,
      duration: "30 mins",
      points: 200,
      description: "Dynamic programming, Graph theory, Dijkstra, Floyd-Warshall and Big-O analysis.",
      youtubeId: "0IAPZzGSbME",
      videoTitle: "Algorithms Analysis & Graph Theory Primer"
    },
    {
      id: "ass-3",
      title: "JavaScript Basics & Modern ES6+",
      category: "mock",
      difficulty: "Easy",
      questions: 4,
      duration: "15 mins",
      points: 50,
      description: "Closures, Event Loop, Promises, Array methods, and ES6 modern standards.",
      youtubeId: "W6NZfCO5SIk",
      videoTitle: "Modern JavaScript (ES6+) Complete Mastery Guide"
    }
  ];

  const filteredAssessments = assessments.filter(a => {
    const matchesFilter = filter === "all" || a.category === filter;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Assessments & Certifications</h1>
            </div>
            <p className="text-zinc-400 max-w-lg text-sm leading-relaxed">
              Take timed mock tests, validate core computer science fundamentals, and earn points directly applied to your institutional profile.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center min-w-[120px] shadow-[0_0_10px_rgba(139,92,246,0.05)]">
              <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1 font-medium font-mono uppercase">
                <Target className="w-3.5 h-3.5" /> Total Tests
              </p>
              <p className="text-2xl font-bold text-violet-400 font-mono">3</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center min-w-[120px] shadow-[0_0_10px_rgba(139,92,246,0.05)]">
              <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1 font-medium font-mono uppercase">
                <Award className="w-3.5 h-3.5" /> Max Points
              </p>
              <p className="text-2xl font-bold text-amber-400 font-mono">350</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === "all" 
                ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-50'
            }`}
          >
            All Assessments
          </button>
          <button 
            onClick={() => setFilter("mock")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === "mock" 
                ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-50'
            }`}
          >
            Mock Tests
          </button>
          <button 
            onClick={() => setFilter("cert")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === "cert" 
                ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-50'
            }`}
          >
            Certifications
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assessments..." 
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-50 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Assessment Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssessments.map((assessment) => (
          <div key={assessment.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col group">
            <div className="flex justify-between items-start mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(assessment.difficulty)}`}>
                {assessment.difficulty}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold font-mono">
                <Award className="w-4 h-4 text-amber-400" />
                {assessment.points} pts
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-violet-400 transition-colors">
              {assessment.title}
            </h3>

            <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              {assessment.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono mt-auto pt-4 border-t border-zinc-800/80">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" /> {assessment.questions} Qs
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> {assessment.duration}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3">
              <button
                onClick={() => setPrepVideo(assessment)}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Prep Video</span>
              </button>
              <Link 
                href={`/user/assessments/${assessment.id}`}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)]"
              >
                <span>Start Test</span>
                <Play className="w-3 h-3 fill-current" />
              </Link>
            </div>
          </div>
        ))}
        
        {filteredAssessments.length === 0 && (
          <div className="col-span-full p-12 text-center text-zinc-500 flex flex-col items-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
            <Brain className="w-12 h-12 mb-4 text-zinc-700" />
            <p className="font-medium text-sm">No assessments match your criteria.</p>
          </div>
        )}
      </div>

      {/* Embedded YouTube Assessment Prep Video Modal */}
      {prepVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-zinc-50 text-base">
                  {prepVideo.title}: {prepVideo.videoTitle}
                </h3>
              </div>
              <button
                onClick={() => setPrepVideo(null)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1.5 rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video border border-zinc-800 shadow-xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${prepVideo.youtubeId}?autoplay=1&rel=0`}
                title={`${prepVideo.title} Prep Lecture`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Review the high-yield concepts above before sitting for the timed evaluation.</span>
              <button
                onClick={() => setPrepVideo(null)}
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
