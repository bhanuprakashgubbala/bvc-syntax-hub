import { db } from "@/lib/db";
import Link from "next/link";
import { Swords, Code2, Clock, CheckCircle2, ChevronRight, Award, Target, Brain, Play } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CodeArenaPage() {
  const problems = await db.problem.findMany({
    orderBy: {
      points: 'asc'
    }
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
                <Swords className="w-6 h-6 text-violet-400" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">CodeArena</h1>
            </div>
            <p className="text-zinc-400 max-w-lg">
              Compete against yourself and others. Solve algorithmic challenges, improve your data structures knowledge, and earn points to climb the leaderboard.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center min-w-[120px] shadow-[0_0_10px_rgba(139,92,246,0.05)]">
              <p className="text-sm text-zinc-500 mb-1 flex items-center justify-center gap-1 font-medium">
                <Target className="w-4 h-4" /> Solved
              </p>
              <p className="text-2xl font-bold text-emerald-400">0</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center min-w-[120px] shadow-[0_0_10px_rgba(139,92,246,0.05)]">
              <p className="text-sm text-zinc-500 mb-1 flex items-center justify-center gap-1 font-medium">
                <Award className="w-4 h-4" /> Rank
              </p>
              <p className="text-2xl font-bold text-amber-400">#42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_10px_rgba(139,92,246,0.4)] hover:bg-violet-500 transition-colors">All Problems</button>
          <button className="px-4 py-2 bg-zinc-900 text-zinc-400 text-sm font-medium rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">Algorithms</button>
          <button className="px-4 py-2 bg-zinc-900 text-zinc-400 text-sm font-medium rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">Data Structures</button>
        </div>
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search problems..." 
            className="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-50 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder-zinc-500 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
          />
        </div>
      </div>

      {/* Problem Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((problem) => (
          <div key={problem.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col group">
            <div className="flex justify-between items-start mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium">
                <Award className="w-4 h-4 text-amber-400" />
                {problem.points} pts
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-50 mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">
              {problem.title}
            </h3>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-1 text-sm text-zinc-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-zinc-600" />
                Unsolved
              </div>
              <Link 
                href={`/user/codearena/${problem.id}`}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-lg text-sm font-semibold transition-colors"
              >
                Open <Play className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
        
        {problems.length === 0 && (
          <div className="col-span-full p-12 text-center text-zinc-500 flex flex-col items-center border border-dashed border-zinc-700 rounded-xl bg-zinc-900/50">
            <Brain className="w-12 h-12 mb-4 text-zinc-700" />
            <p className="font-medium">No problems found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
