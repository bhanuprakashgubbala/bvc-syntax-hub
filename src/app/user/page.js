"use client";
import { Trophy, Star, ChevronRight, GraduationCap, Building2, BookOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export default function UserDashboard() {
  const { user: authUser } = useUser();

  const computeInitials = (name, email) => {
    if (name && name !== "Student" && name !== "BVC Student") {
      const parts = name.split(" ").filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      const clean = email.split("@")[0];
      return clean.slice(0, 2).toUpperCase();
    }
    return "ST";
  };

  const userData = {
    name: authUser?.name || authUser?.fullName || "Student",
    email: authUser?.email || "",
    studentId: authUser?.studentId || authUser?.rollNumber || "",
    branchName: authUser?.branchName || "Computer Science and Engineering",
    branchShort: authUser?.branchShort || "CSE",
    section: authUser?.section || "CSE-A",
    department: authUser?.department || "Computer Science & Engineering",
    batchYear: authUser?.batchYear || "2029",
    organization: authUser?.organization || "BVCEC Odalarevu",
    points: authUser?.points ?? authUser?.totalPoints ?? 0,
    initials: computeInitials(authUser?.name || authUser?.fullName, authUser?.email),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-50">Dashboard</h1>
      
      {/* Student Profile Card with Auto-detected Branch */}
      <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-violet-600 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {userData.initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-zinc-900 rounded-full shadow-[0_0_8px_#10B981]"></div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-4">
            {/* Student Name & Badges */}
            <div className="col-span-2 md:col-span-5">
              <p className="text-xs text-zinc-400 mb-1 font-mono uppercase tracking-wider">Student Profile</p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-bold text-xl text-zinc-50 uppercase tracking-tight">
                  {userData.name}
                </h2>
                <span className="px-2.5 py-0.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-full text-xs font-medium">
                  {userData.branchShort}
                </span>
                <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full text-xs font-mono">
                  Batch {userData.batchYear}
                </span>
              </div>
            </div>

            <div className="col-span-2 md:col-span-2">
              <p className="text-xs text-zinc-400 mb-1 font-mono">Institutional Email</p>
              <p className="font-semibold text-zinc-200 text-sm truncate font-mono" title={userData.email}>{userData.email}</p>
            </div>

            <div className="col-span-1 md:col-span-1">
              <p className="text-xs text-zinc-400 mb-1 font-mono">Register No (ID)</p>
              <p className="font-bold text-emerald-400 font-mono text-sm tracking-wide">{userData.studentId}</p>
            </div>

            <div className="col-span-1 md:col-span-1">
              <p className="text-xs text-zinc-400 mb-1 font-mono">College / Campus</p>
              <p className="font-semibold text-zinc-200 text-sm">{userData.organization}</p>
            </div>

            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-zinc-400 mb-1 font-mono">Department</p>
              <p className="font-semibold text-zinc-200 text-sm truncate" title={userData.department}>{userData.department}</p>
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-800 text-center min-w-[140px] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <p className="text-xs text-emerald-400 font-mono uppercase mb-1">Total Points</p>
            <div className="flex items-center justify-center gap-1.5">
              <Star className="w-5 h-5 text-emerald-400 fill-emerald-400 shadow-emerald-500/50" />
              <span className="text-3xl font-bold text-emerald-100 font-mono">{userData.points}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Tier */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-500" />
              Academic & Coding Tier
            </h2>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 font-semibold text-sm rounded-full border border-cyan-500/20">
              Rookie Lv1
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 font-medium">Progress to Lv2</span>
              <span className="text-violet-400 font-bold">{userData.points} / 99 pts</span>
            </div>
            
            <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 relative transition-all" 
                style={{ width: `${Math.min(100, Math.max(5, (userData.points / 99) * 100))}%` }}
              >
                 <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 blur-[1px]"></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-violet-500 text-violet-400 flex items-center justify-center font-bold text-sm mx-auto mb-2 shadow-[0_0_10px_rgba(139,92,246,0.3)]">1</div>
                <p className="text-xs font-semibold text-zinc-50">Rookie</p>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-zinc-700 mx-4"></div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border-2 border-zinc-800 text-zinc-500 flex items-center justify-center font-bold text-sm mx-auto mb-2">2</div>
                <p className="text-xs font-medium text-zinc-400">Novice</p>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-zinc-700 mx-4"></div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border-2 border-zinc-800 text-zinc-500 flex items-center justify-center font-bold text-sm mx-auto mb-2">3</div>
                <p className="text-xs font-medium text-zinc-400">Scholar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 14 Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-zinc-50 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
          Platform Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ModuleCard href="/user/tasks" icon="ListTodo" title="Tasks & Labs" desc="Academic Lab Tasks & Records" color="violet" />
          <ModuleCard href="/user/codespace" icon="Terminal" title="Codespace" desc="Cloud IDE & Compiler" color="violet" />
          <ModuleCard href="/user/codearena" icon="Swords" title="CodeArena" desc="Competitive Coding" color="violet" />
          <ModuleCard href="/user/assessments" icon="FileText" title="Assessments" desc="Mock Tests & Exams" color="emerald" />
          <ModuleCard href="/user/leaderboard" icon="Crown" title="Leaderboard" desc="Global Rankings" color="violet" />
          <ModuleCard href="/user/lsrw" icon="Headphones" title="LSRW" desc="Language Training" color="violet" />
          <ModuleCard href="/user/practice" icon="Target" title="Practice" desc="Topic-wise MCQs" color="violet" />
          <ModuleCard href="/user/typing-test" icon="Keyboard" title="Typing Test" desc="Speed & Accuracy" color="violet" />
          <ModuleCard href="/user/courses" icon="BookOpen" title="Courses" desc="Structured Learning" color="violet" />
          <ModuleCard href="/user/visualizer" icon="BoxSelect" title="DSA Visualizer" desc="Algorithm Demos" color="violet" />
          <ModuleCard href="/user/pair-programming" icon="Users" title="Pair Programming" desc="Collaborative Code" color="violet" />
          <ModuleCard href="/user/blogs" icon="Newspaper" title="Blogs" desc="Articles & Posts" color="violet" />
          <ModuleCard href="/user/pentest" icon="ShieldAlert" title="CS PenTest Lab" desc="Cybersecurity" color="emerald" />
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ href, icon, title, desc, color }) {
  const IconComponent = Icons[icon] || Icons.Code;
  
  const colorMap = {
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/50 group-hover:bg-violet-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20",
  };

  return (
    <Link href={href} className="group block p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors mb-4 ${colorMap[color]}`}>
        <IconComponent className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-zinc-50 mb-1">{title}</h3>
      <p className="text-xs font-medium text-zinc-400">{desc}</p>
    </Link>
  );
}
