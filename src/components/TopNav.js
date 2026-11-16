"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  ShieldAlert,
  User,
  Code2,
  Award,
  Trophy,
  ChevronDown,
  Mail,
  Building2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseRegistrationNumber } from "@/lib/studentParser";

export default function TopNav() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Student",
    email: "",
    studentId: "",
    branchShort: "Student",
    section: "",
    department: "",
    batchYear: "",
    organization: "BVC Group",
    points: 0,
    initials: "ST",
  });
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const userId = localStorage.getItem("nextgen-user-id");
    const storedEmail = localStorage.getItem("nextgen-user-email");
    const storedName = localStorage.getItem("nextgen-user-name");
    const storedPoints = localStorage.getItem("nextgen-user-points");

    if (storedEmail) {
      const parsed = parseRegistrationNumber(storedEmail);
      setUserData({
        name: storedName || parsed.fullName,
        email: storedEmail,
        studentId: parsed.studentId,
        branchShort: parsed.branchShort,
        department: (parsed.department || '').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
        batchYear: parsed.batchYear,
        organization: parsed.college,
        points: parseInt(storedPoints || "0", 10),
        initials: computeInitials(storedName || parsed.fullName, storedEmail),
      });
    }

    if (userId) {
      fetch(`/api/user/me?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const u = data.user;
            const parsed = parseRegistrationNumber(u.email);
            setUserData({
              name: u.fullName || parsed.fullName,
              email: u.email,
              studentId: u.studentId || parsed.studentId,
              branchShort: u.branchShort || parsed.branchShort,
              department: (u.department || parsed.department || '').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
              batchYear: u.batchYear || parsed.batchYear,
              organization: u.organization || parsed.college,
              points: u.totalPoints || 0,
              initials: computeInitials(u.fullName || parsed.fullName, u.email),
            });
          }
        })
        .catch(() => {});
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#08090D]/90 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 p-0.5 flex items-center justify-center shrink-0">
          <img 
            src="/bvc-logo.png" 
            alt="BVCEC Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-zinc-50 font-semibold text-sm md:text-base flex items-center flex-wrap gap-2.5">
          <span>Hello, <span className="uppercase text-emerald-400 font-extrabold tracking-wide">{userData.name}</span></span>
          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 bg-white/[0.05] text-zinc-300 rounded-md text-[11px] font-mono border border-white/[0.08]">
            BVCEC • {userData.department || "Autonomous"}
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          href="/user/tasks"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        >
          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
          <span>My Lab Tasks</span>
        </Link>

        <div className="h-5 w-px bg-white/[0.08] hidden sm:block"></div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                {userData.initials}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0D0D11] rounded-full shadow-[0_0_5px_#10B981]"></div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-zinc-50 leading-none truncate max-w-[140px]">
                {userData.name}
              </p>
              <p className="text-xs text-zinc-400 mt-1 font-mono">{userData.studentId}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#18181B] border border-zinc-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header Info */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-base border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    {userData.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-50 text-base truncate">
                      {userData.name}
                    </h3>
                    <p className="text-xs text-violet-400 flex items-center gap-1 font-medium mt-0.5">
                      <Trophy className="w-3 h-3" /> {userData.points} Points
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate" title={userData.email}>
                      {userData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">
                      {userData.organization} • {userData.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate font-mono">
                      Batch {userData.batchYear} • ID: {userData.studentId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coding Performance Section */}
              <div className="p-4 border-b border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5" /> Language Proficiency
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-medium">Python</span>
                      <span className="text-emerald-400 font-mono">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-medium">C / C++</span>
                      <span className="text-cyan-400 font-mono">84%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: "84%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
