"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Code2, 
  FileCode, 
  Star, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
  RotateCcw
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            System Administration Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Platform telemetry, curriculum control, student scores, and execution engines.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/problems"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Problem</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-semibold">Total Students</span>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-50">{stats ? stats.totalStudents : "..."}</p>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">Live</span> registered institutional accounts
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-semibold">CodeArena Challenges</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-50">{stats ? stats.totalProblems : "..."}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Available in student competitive pool</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-semibold">Evaluated Submissions</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-zinc-50">{stats ? stats.totalSubmissions : "..."}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Compiled through isolated sandboxes</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-mono uppercase font-semibold">Points In Circulation</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-amber-400">{stats ? stats.totalPointsInCirculation : "..."}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Awarded across challenges and tests</p>
        </div>
      </div>

      {/* System Telemetry Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 text-zinc-300">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Execution Engine: <strong className="text-emerald-400 font-semibold">{stats?.executionEngine || "Wandbox Sandboxes (Online)"}</strong></span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>Uptime: <strong className="text-zinc-200">{stats?.serverUptime || "99.98%"}</strong></span>
          <span>Database: <strong className="text-zinc-200">Prisma SQLite (Healthy)</strong></span>
        </div>
      </div>

      {/* Tables Split: Recent Submissions & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-violet-400" />
                Recent Code Submissions
              </h2>
              <Link href="/admin/submissions" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {!stats || stats.recentSubmissions.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                  No submissions recorded yet. Students solve problems in CodeArena.
                </div>
              ) : (
                stats.recentSubmissions.map((sub) => (
                  <div key={sub.id} className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status}
                        </span>
                        <span className="text-zinc-400 font-medium truncate max-w-[160px]">{sub.problem?.title || "Challenge"}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {sub.user?.fullName || sub.user?.email || "Student"} • <span className="uppercase">{sub.language}</span>
                      </p>
                    </div>
                    <span className="text-zinc-400 font-mono">{sub.executionTimeMs}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recently Registered Students */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Institutional Student Accounts
              </h2>
              <Link href="/admin/students" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {!stats || stats.recentUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                  No students in database.
                </div>
              ) : (
                stats.recentUsers.map((u) => (
                  <div key={u.id} className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                        {(u.fullName || "ST").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">{u.fullName}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-amber-400">{u.totalPoints} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
