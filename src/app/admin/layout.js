"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Code2, 
  Users, 
  FileCode, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  Terminal,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

const ADMIN_NAV = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Problems Manager", href: "/admin/problems", icon: Code2 },
  { name: "Students & Scores", href: "/admin/students", icon: Users },
  { name: "Submissions Log", href: "/admin/submissions", icon: FileCode },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // If on /admin/login, bypass admin layout checks
    if (pathname === "/admin/login") return;

    const token = localStorage.getItem("nextgen-admin-token");
    const userStr = localStorage.getItem("nextgen-admin-user");

    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
      return;
    }

    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        setAdminUser({ name: "Administrator", role: "SuperAdmin" });
      }
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleSignOut = () => {
    localStorage.removeItem("nextgen-admin-token");
    localStorage.removeItem("nextgen-admin-user");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-50 font-sans selection:bg-amber-500/30 selection:text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0B0C10] border-r border-zinc-800 flex flex-col fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-100">NextGen Admin</h1>
              <p className="text-[10px] text-amber-400 font-mono font-semibold">ROOT CONSOLE</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Switcher & Sign Out */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/user"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors border border-zinc-800"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
              <span>Student View</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">/user</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-[#0B0C10] border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Admin Authorization: Active
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-zinc-400 font-mono">Environment: SQLite (dev.db)</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                A
              </div>
              <span className="font-semibold">{adminUser?.name || "System Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
