"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListTodo,
  Trophy, 
  BookOpen, 
  FileText, 
  Code2, 
  Terminal, 
  Keyboard, 
  GraduationCap, 
  Video, 
  MonitorPlay,
  Sparkles,
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const navSections = [
  {
    title: "ACADEMIC PORTAL",
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/user' },
      { name: 'Tasks & Digital Labs', icon: ListTodo, href: '/user/tasks', badge: 'Active' },
      { name: 'Code Space', icon: Terminal, href: '/user/codespace', highlight: true },
      { name: 'Assessments', icon: FileText, href: '/user/assessments' },
    ]
  },
  {
    title: "CODING & ARENA",
    items: [
      { name: 'CodeArena', icon: Code2, href: '/user/codearena' },
      { name: 'Leaderboard', icon: Trophy, href: '/user/leaderboard' },
      { name: 'Practice', icon: Sparkles, href: '/user/practice' },
      { name: 'DSA Visualizer', icon: MonitorPlay, href: '/user/visualizer' },
      { name: 'Typing Test', icon: Keyboard, href: '/user/typing-test' },
    ]
  },
  {
    title: "LEARNING",
    items: [
      { name: 'Courses', icon: GraduationCap, href: '/user/courses' },
      { name: 'Trainings', icon: Video, href: '/user/trainings' },
      { name: 'LSRW Skills', icon: BookOpen, href: '/user/lsrw' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#08090D] border-r border-white/[0.08] flex flex-col fixed left-0 top-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-40 select-none">
      
      {/* Sleek BVCEC CSE Brand Header with Official College Logo */}
      <div className="p-4 sticky top-0 bg-[#08090D]/95 backdrop-blur-md z-10 border-b border-white/[0.08]">
        <Link href="/user" className="flex items-center gap-3 group">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.25)] group-hover:border-violet-500/50 transition-all">
              <img 
                src="/bvc-logo.png" 
                alt="BVCEC College Logo" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#08090D] rounded-full shadow-[0_0_8px_#10B981]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight group-hover:text-violet-300 transition-colors truncate">
                BVCEC CODELAB
              </h1>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 truncate flex items-center gap-1">
              <span>BVC Odalarevu</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-semibold">Autonomous</span>
            </p>
          </div>
        </Link>
      </div>
      
      {/* Categorized Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>{section.title}</span>
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/user');
                
                return (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                        isActive 
                          ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent text-white border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                          : item.highlight
                            ? 'text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-violet-500/15'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive 
                            ? 'text-violet-400' 
                            : item.highlight 
                              ? 'text-indigo-400' 
                              : 'text-zinc-500 group-hover:text-zinc-300'
                        }`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}

                      {item.highlight && !isActive && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                          Code
                        </span>
                      )}

                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8B5CF6]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Institutional Student Status Bar */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0A0B10] space-y-2 mt-auto">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Student Portal</span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] text-center">
          <p className="text-[11px] font-semibold text-zinc-300">BVCEC Autonomous</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">CSE Digital Lab Environment</p>
        </div>
      </div>
    </aside>
  );
}
