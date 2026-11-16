"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  ArrowLeft, 
  Crown, 
  Medal, 
  User, 
  Search, 
  Star, 
  Building2, 
  GraduationCap,
  Sparkles,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  useEffect(() => {
    fetch("/api/user/leaderboard")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(err => console.error("Leaderboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const departments = ["all", ...new Set(leaderboard.map(u => u.branchShort || u.department).filter(Boolean))];

  const filteredLeaderboard = leaderboard.filter(user => {
    const matchesDept = selectedDept === "all" || (user.branchShort === selectedDept || user.department === selectedDept);
    const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const topThree = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

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
              <Trophy className="w-6 h-6 text-amber-400" />
              Institutional Leaderboard
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time ranking of students across algorithmic problems, tests, and labs.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase font-mono transition-all cursor-pointer ${
              selectedDept === dept
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {dept === "all" ? "All Departments" : dept}
          </button>
        ))}
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-2 relative z-10">
            {/* Rank 2 */}
            {topThree[1] && (
              <div className="flex flex-col items-center p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 order-2 md:order-1">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center text-xl font-bold font-mono mb-3 border border-zinc-700 shadow-md">
                  #2
                </div>
                <h3 className="font-bold text-zinc-50 text-base truncate max-w-[180px]">{topThree[1].name}</h3>
                <span className="text-xs text-zinc-400 font-mono mt-0.5">{topThree[1].studentId} • {topThree[1].branchShort}</span>
                <p className="text-sm font-bold text-violet-400 font-mono mt-3">{topThree[1].points} pts</p>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="flex flex-col items-center p-6 rounded-2xl border border-amber-500/40 bg-zinc-950/80 shadow-[0_0_30px_rgba(245,158,11,0.15)] order-1 md:order-2 md:-mt-4">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-bold mb-3 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Crown className="w-10 h-10 fill-amber-400/20" />
                </div>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold font-mono mb-1">
                  Champion #1
                </span>
                <h3 className="font-bold text-zinc-50 text-lg truncate max-w-[200px]">{topThree[0].name}</h3>
                <span className="text-xs text-zinc-400 font-mono">{topThree[0].studentId} • {topThree[0].branchShort}</span>
                <p className="text-base font-bold text-amber-400 font-mono mt-3">{topThree[0].points} pts</p>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className="flex flex-col items-center p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 order-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-900/30 text-amber-500 flex items-center justify-center text-xl font-bold font-mono mb-3 border border-amber-900/50 shadow-md">
                  #3
                </div>
                <h3 className="font-bold text-zinc-50 text-base truncate max-w-[180px]">{topThree[2].name}</h3>
                <span className="text-xs text-zinc-400 font-mono mt-0.5">{topThree[2].studentId} • {topThree[2].branchShort}</span>
                <p className="text-sm font-bold text-violet-400 font-mono mt-3">{topThree[2].points} pts</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranked List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase font-mono px-4 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-6">
            <span className="w-8 text-center">Rank</span>
            <span>Student</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline">Department</span>
            <span className="w-20 text-right">Points</span>
          </div>
        </div>

        {remaining.length === 0 && topThree.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            {loading ? "Loading live leaderboard data..." : "No students found matching your criteria."}
          </div>
        ) : (
          remaining.map((student, idx) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3.5 bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-800/60 rounded-xl transition-all"
            >
              <div className="flex items-center gap-6">
                <span className="w-8 text-center font-mono font-bold text-zinc-400 text-sm">
                  #{idx + 4}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold text-xs flex items-center justify-center">
                    {student.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">{student.name}</h4>
                    <p className="text-xs text-zinc-500 font-mono">{student.studentId || student.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-zinc-900 text-zinc-400 rounded-md text-xs font-mono border border-zinc-800">
                  {student.branchShort}
                </span>
                <span className="w-20 text-right font-mono font-bold text-violet-400 text-sm">
                  {student.points} pts
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
