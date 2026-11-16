'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Layers, 
  FileText, 
  GraduationCap, 
  LogOut, 
  LayoutDashboard,
  CheckCircle2,
  PlusCircle,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Faculty Dashboard', href: '/faculty', icon: LayoutDashboard },
  { name: 'My Assigned Classes', href: '/faculty/allocations', icon: Layers },
  { name: 'Create Lab Task', href: '/faculty/tasks', icon: PlusCircle },
  { name: 'Tasks & Observations', href: '/faculty/observations', icon: FileText },
];

export default function FacultyLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [facultyUser, setFacultyUser] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('bvcec-user-role');
    const name = localStorage.getItem('bvcec-user-name');
    const email = localStorage.getItem('bvcec-user-email');
    const id = localStorage.getItem('bvcec-user-id');
    if (name) {
      setFacultyUser({ id, name, email, role: role || 'FACULTY' });
    } else {
      setFacultyUser({ id: 'faculty-java', name: 'Prof. S. R. Sharma', email: 'faculty.java@bvcgroup.in', role: 'FACULTY' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bvcec-user-role');
    localStorage.removeItem('bvcec-user-id');
    localStorage.removeItem('bvcec-user-name');
    localStorage.removeItem('bvcec-user-email');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100 flex flex-col font-sans">
      {/* Institutional Top Header */}
      <header className="bg-[#0f0f18] border-b border-zinc-800/80 px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <img 
                src="/bvc-logo.png" 
                alt="BVCEC Official Logo" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Autonomous Institution • Odalaravu
                </span>
                <span className="text-xs text-zinc-500">Est. 1997</span>
              </div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
                BONAM VENKATACHALAM ENGINEERING COLLEGE
              </h1>
              <p className="text-xs text-indigo-300/90 font-medium">
                Department of Computer Science and Engineering — Faculty Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-zinc-200">{facultyUser?.name || 'Faculty Member'}</p>
              <p className="text-[11px] text-indigo-400 font-mono">{facultyUser?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
              FAC
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Faculty Navigation Sub-Bar */}
      <nav className="bg-[#12121c] border-b border-zinc-800/80 px-6 py-2 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            HOD-Assigned Access Active
          </div>
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      <footer className="border-t border-zinc-900 bg-[#0c0c12] py-4 text-center text-xs text-zinc-500">
        <p>Bonam Venkatachalam Engineering College, Allavaram Mandal, Odalaravu – 533210</p>
        <p className="text-[11px] text-zinc-600 mt-1">CSE Digital Laboratory Management System</p>
      </footer>
    </div>
  );
}

