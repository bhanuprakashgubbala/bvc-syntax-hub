"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  X,
  UserCheck,
  UserPlus,
  Phone,
  Hash,
  School,
  Calendar,
  Layers,
  ChevronRight,
  BookOpenCheck,
  Check,
  Building2,
  RefreshCw
} from "lucide-react";
import { parseStudentRegisterNumber, BRANCH_CODES } from "@/lib/studentParser";

export default function LoginPage() {
  const router = useRouter();

  // Active Login Role Card: 'STUDENT' | 'FACULTY' | 'HOD'
  const [activeRole, setActiveRole] = useState("STUDENT");

  // Student Mode: 'LOGIN' | 'REGISTER'
  const [studentMode, setStudentMode] = useState("LOGIN");

  // Existing Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState("25221A0501");
  const [password, setPassword] = useState("student123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Student Registration Form States
  const [regForm, setRegForm] = useState({
    registerNumber: "",
    studentName: "",
    mobileNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google SSO Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Real-time Student Register Number Identification
  const identifiedDetails = useMemo(() => {
    if (!regForm.registerNumber || regForm.registerNumber.trim().length === 0) {
      return null;
    }
    return parseStudentRegisterNumber(regForm.registerNumber.trim());
  }, [regForm.registerNumber]);

  // Switch Active Role
  const handleRoleSelect = (role) => {
    setActiveRole(role);
    setError(null);
    setSuccessMsg(null);

    if (role === "STUDENT") {
      setLoginIdentifier("25221A0501");
      setPassword("student123");
    } else if (role === "FACULTY") {
      setLoginIdentifier("faculty.java@bvcgroup.in");
      setPassword("faculty123");
    } else if (role === "HOD") {
      setLoginIdentifier("hod.cse@bvcgroup.in");
      setPassword("hod123");
    }
  };

  // Persist session keys for all parts of the application
  const persistSessionAndRedirect = (user) => {
    try {
      // 1. BVCEC Institutional Session Storage
      localStorage.setItem("bvcec-user-id", user.id);
      localStorage.setItem("bvcec-user-email", user.email);
      localStorage.setItem("bvcec-user-name", user.fullName || "User");
      localStorage.setItem("bvcec-user-role", user.role || activeRole);
      localStorage.setItem("bvcec-user-roll", user.rollNumber || user.studentId || "");
      localStorage.setItem("bvcec-user-section", user.sectionName || "CSE-A");
      localStorage.setItem("bvcec-user-section-id", user.sectionId || "");

      // 2. NextGen Lab Workspace Session Storage
      localStorage.setItem("nextgen-user-id", user.id);
      localStorage.setItem("nextgen-user-email", user.email);
      localStorage.setItem("nextgen-user-name", user.fullName || "User");
      localStorage.setItem("nextgen-user-role", user.role || activeRole);
      localStorage.setItem("nextgen-user-studentid", user.rollNumber || user.studentId || user.employeeId || "");
      localStorage.setItem("nextgen-user-dept", user.department || "Computer Science & Engineering");
      localStorage.setItem("nextgen-user-section", user.sectionName || "CSE-A");
      localStorage.setItem("nextgen-user-section-id", user.sectionId || "");
      localStorage.setItem("nextgen-user-batch", user.batchYear || "2029");
      localStorage.setItem("nextgen-user-points", String(user.totalPoints || 0));

      if (rememberMe) {
        localStorage.setItem("codex_remembered_role", user.role || activeRole);
        localStorage.setItem("codex_remembered_email", user.email);
      }
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    // Role-based portal routing
    if (user.role === "HOD") {
      router.push("/hod");
    } else if (user.role === "FACULTY") {
      router.push("/faculty");
    } else {
      router.push("/user");
    }
  };

  // Standard Login (Student, Faculty, HOD)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginIdentifier.trim(),
          password: password,
          requestedRole: activeRole
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setSuccessMsg(`Welcome, ${data.user.fullName}! Entering ${data.user.role} Portal...`);
        setTimeout(() => {
          persistSessionAndRedirect(data.user);
        }, 400);
      } else {
        setError(data.error || "Authentication failed. Please verify your credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network or security gateway error. Please try again.");
      setIsLoading(false);
    }
  };

  // Student Registration (Create New Account)
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Client-side validations
    if (!identifiedDetails || !identifiedDetails.isValid) {
      setError(identifiedDetails?.error || "Please enter a valid 10-character Register Number (e.g. 25221A0556).");
      return;
    }

    if (!regForm.studentName.trim() || regForm.studentName.trim().length < 2) {
      setError("Please enter your full Student Name.");
      return;
    }

    const cleanMobile = regForm.mobileNumber.trim().replace(/[\s-+()]/g, "");
    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      setError("Registered Mobile Number must be exactly 10 digits.");
      return;
    }

    if (regForm.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setError("Passwords do not match. Please verify both passwords.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerNumber: regForm.registerNumber.trim(),
          studentName: regForm.studentName.trim(),
          mobileNumber: cleanMobile,
          password: regForm.password,
          confirmPassword: regForm.confirmPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setSuccessMsg(`Registration Successful! Welcome, ${data.user.fullName}. Redirecting to Student Workspace...`);
        setTimeout(() => {
          persistSessionAndRedirect(data.user);
        }, 500);
      } else {
        setError(data.error || "Registration failed. Please check your details.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Server connection error during registration. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle Google Token Response from GIS
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
          role: activeRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setSuccessMsg(`Google SSO Verified! Welcome, ${data.user.fullName}!`);
        setTimeout(() => {
          persistSessionAndRedirect(data.user);
        }, 300);
      } else {
        setError(data.error || "Google authentication failed.");
        setIsLoading(false);
      }
    } catch (e) {
      setError("Failed to verify Google token with backend.");
      setIsLoading(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && clientId.trim()) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });
        } catch (e) {}
      }
    }
  }, []);

  const handleContinueWithGoogle = () => {
    setError(null);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && clientId.trim() && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleModalOpen(true);
          }
        });
        return;
      } catch (e) {}
    }
    setIsGoogleModalOpen(true);
  };

  const handleGoogleDirectSubmit = async (selectedEmail, selectedName) => {
    setIsGoogleSubmitting(true);
    setError(null);

    const emailToUse = selectedEmail || googleEmailInput.trim();
    const nameToUse = selectedName || googleNameInput.trim();

    if (!emailToUse) {
      setError("Please provide a valid Google Account email.");
      setIsGoogleSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          fullName: nameToUse,
          role: activeRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setIsGoogleModalOpen(false);
        setSuccessMsg(`Google SSO Verified: ${data.user.fullName}! Entering Portal...`);
        setTimeout(() => {
          persistSessionAndRedirect(data.user);
        }, 300);
      } else {
        setError(data.error || "Google authorization failed.");
      }
    } catch (err) {
      setError("Network error communicating with Google SSO API.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 font-sans">
      
      {/* Google Identity Services Library */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (clientId && clientId.trim() && window.google?.accounts?.id) {
            try {
              window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCredentialResponse,
              });
            } catch (e) {}
          }
        }}
      />

      {/* Official College Institutional Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0d13]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            {/* Official College Logo Image */}
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <img 
                src="/bvc-logo.png" 
                alt="Bonam Venkata Chalamayya Engineering College" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">
                Bonam Venkata Chalamayya Engineering College
              </h1>
              <p className="text-[11px] font-semibold text-violet-400 tracking-wider uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <span>(Autonomous) • Odalarevu</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-normal">Affiliated to JNTUK • Accredited NAAC 'A'</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Institutional Gateway Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
        
        {/* Hero Title with College Crest */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 p-2 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <img 
              src="/bvc-logo.png" 
              alt="BVCEC Official Crest" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            BVC SYNTAX HUB LOG IN
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium">
            Bonam Venkatachalam Engineering College (Autonomous) • Smart Digital Lab Observation & Academic Management System
          </p>
        </div>

        {/* 1. THREE ROLE CARDS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mb-8">
          
          {/* Card 1: Student Login */}
          <div 
            onClick={() => handleRoleSelect("STUDENT")}
            className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between ${
              activeRole === "STUDENT"
                ? "bg-gradient-to-b from-violet-950/40 via-zinc-900/90 to-zinc-950 border-violet-500/60 shadow-[0_0_30px_rgba(139,92,246,0.25)] ring-2 ring-violet-500/30"
                : "bg-zinc-900/60 hover:bg-zinc-900/90 border-white/[0.08] hover:border-zinc-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activeRole === "STUDENT" 
                    ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full ${
                  activeRole === "STUDENT" 
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" 
                    : "bg-zinc-800/80 text-zinc-400"
                }`}>
                  UG Students
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>Student Login</span>
                {activeRole === "STUDENT" && <span className="w-2 h-2 rounded-full bg-violet-400"></span>}
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Access assigned lab programming experiments, write & execute in the multi-server Code Space, and submit digital observations for automated evaluation.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-violet-400">
                {activeRole === "STUDENT" ? "Active Selection" : "Click to Select"}
              </span>
              <button 
                type="button"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeRole === "STUDENT"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <span>Student Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Faculty Login */}
          <div 
            onClick={() => handleRoleSelect("FACULTY")}
            className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between ${
              activeRole === "FACULTY"
                ? "bg-gradient-to-b from-indigo-950/40 via-zinc-900/90 to-zinc-950 border-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/30"
                : "bg-zinc-900/60 hover:bg-zinc-900/90 border-white/[0.08] hover:border-zinc-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activeRole === "FACULTY" 
                    ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  <Users className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full ${
                  activeRole === "FACULTY" 
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                    : "bg-zinc-800/80 text-zinc-400"
                }`}>
                  Faculty In-Charge
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>Faculty Login</span>
                {activeRole === "FACULTY" && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Allocate lab experiments to sections, supervise student coding in real time, review AI evaluation reports, and assign official marks with feedback.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-400">
                {activeRole === "FACULTY" ? "Active Selection" : "Click to Select"}
              </span>
              <button 
                type="button"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeRole === "FACULTY"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <span>Faculty Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: HOD Login */}
          <div 
            onClick={() => handleRoleSelect("HOD")}
            className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between ${
              activeRole === "HOD"
                ? "bg-gradient-to-b from-amber-950/40 via-zinc-900/90 to-zinc-950 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/30"
                : "bg-zinc-900/60 hover:bg-zinc-900/90 border-white/[0.08] hover:border-zinc-700 opacity-80 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activeRole === "HOD" 
                    ? "bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full ${
                  activeRole === "HOD" 
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                    : "bg-zinc-800/80 text-zinc-400"
                }`}>
                  Department Head
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span>HOD Login</span>
                {activeRole === "HOD" && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Departmental curriculum governance, faculty subject allocations, lab sections management, performance records, and comprehensive lab audit logs.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-400">
                {activeRole === "HOD" ? "Active Selection" : "Click to Select"}
              </span>
              <button 
                type="button"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeRole === "HOD"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <span>HOD Control</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* 2. DEDICATED AUTHENTICATION CONSOLE */}
        <div className="w-full max-w-xl bg-zinc-900/90 border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          
          {/* Subtle Role Gradient Glow */}
          <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            activeRole === "STUDENT" ? "bg-violet-600/15" :
            activeRole === "FACULTY" ? "bg-indigo-600/15" :
            "bg-amber-600/15"
          }`} />

          {/* Card Header with Official College Logo */}
          <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-white/[0.08]">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <img 
                src="/bvc-logo.png" 
                alt="BVCEC Official Logo" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                  activeRole === "STUDENT" ? "bg-violet-500/20 text-violet-300" :
                  activeRole === "FACULTY" ? "bg-indigo-500/20 text-indigo-300" :
                  "bg-amber-500/20 text-amber-300"
                }`}>
                  {activeRole} ACCESS
                </span>
                <span className="text-zinc-600 text-xs">•</span>
                <span className="text-xs text-zinc-400 font-semibold">BVCEC Autonomous</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                {activeRole === "STUDENT" && (studentMode === "LOGIN" ? "Student Account Login" : "Student Registration")}
                {activeRole === "FACULTY" && "Faculty Laboratory Login"}
                {activeRole === "HOD" && "HOD Department Control Login"}
              </h3>
            </div>
          </div>

          {/* STUDENT DUAL MODE SWITCHER: Existing Student Login vs Create New Account */}
          {activeRole === "STUDENT" && (
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-zinc-950 rounded-2xl border border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => {
                  setStudentMode("LOGIN");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  studentMode === "LOGIN"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Existing Student Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStudentMode("REGISTER");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  studentMode === "REGISTER"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{successMsg}</span>
            </div>
          )}

          {/* VIEW A: STUDENT REGISTRATION (CREATE NEW ACCOUNT) */}
          {activeRole === "STUDENT" && studentMode === "REGISTER" ? (
            <form onSubmit={handleStudentRegister} className="space-y-4">
              
              {/* Field 1: Register Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Register Number (10 Characters)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">e.g. 25221A0556</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    value={regForm.registerNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setRegForm(prev => ({ ...prev, registerNumber: val }));
                    }}
                    placeholder="Enter 10-character Register No (e.g. 25221A0556)"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono tracking-wider uppercase transition-colors"
                  />
                  <div className="absolute right-3 top-2.5 text-zinc-500 font-mono text-[11px]">
                    {regForm.registerNumber.length}/10
                  </div>
                </div>

                {/* AUTOMATIC REGISTER NUMBER IDENTIFICATION PANEL */}
                {identifiedDetails && (
                  <div className="mt-2.5 p-3.5 rounded-2xl border transition-all text-xs">
                    {identifiedDetails.isValid ? (
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Academic Details Identified
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                            JNTUK / BVCEC Verified
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-500 block">Admission Year:</span>
                            <span className="font-bold text-zinc-200">{identifiedDetails.admissionYear} (Prefix {identifiedDetails.registerNumber.slice(0, 2)})</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Current Academic Year:</span>
                            <span className="font-bold text-emerald-300">{identifiedDetails.currentAcademicYear}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Year of Study:</span>
                            <span className="font-bold text-violet-300">{identifiedDetails.yearOfStudy}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Identified Branch:</span>
                            <span className="font-bold text-zinc-100">{identifiedDetails.branchName} ({identifiedDetails.branchShort})</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-emerald-500/10 text-[10px] text-zinc-400">
                          <span className="text-emerald-400 font-semibold">Institutional Designation:</span> {identifiedDetails.collegeName}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2.5 text-amber-300 text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{identifiedDetails.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Field 2: Student Name / Username */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Student Full Name / Username
                </label>
                <input
                  type="text"
                  value={regForm.studentName}
                  onChange={(e) => setRegForm(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="e.g. A. Surya Teja"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Field 3: Registered Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Registered Mobile Number</span>
                  <span className="text-[10px] text-zinc-500 font-mono">10 Digits</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={regForm.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setRegForm(prev => ({ ...prev, mobileNumber: val }));
                    }}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono transition-colors"
                  />
                  <Phone className="w-3.5 h-3.5 absolute right-3 top-3 text-zinc-500" />
                </div>
              </div>

              {/* Field 4: Create Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regForm.password}
                      onChange={(e) => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Re-enter password"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Matching Indicator */}
              {regForm.password && regForm.confirmPassword && (
                <div className="text-[11px] font-medium flex items-center gap-1.5">
                  {regForm.password === regForm.confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? "Creating Account..." : "Create Account & Enter Student Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStudentMode("LOGIN")}
                  className="text-xs text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  Already have an account? <span className="underline font-semibold text-violet-400">Sign in here</span>
                </button>
              </div>

            </form>
          ) : (
            /* VIEW B: EXISTING LOGIN (STUDENT, FACULTY, HOD) */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  {activeRole === "STUDENT" && "Register Number / Roll Number"}
                  {activeRole === "FACULTY" && "Faculty Email / Employee ID"}
                  {activeRole === "HOD" && "HOD Institutional Email"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={
                      activeRole === "STUDENT" ? "e.g. 25221A0501 or roll number" :
                      activeRole === "FACULTY" ? "e.g. faculty.java@bvcgroup.in" :
                      "e.g. hod.cse@bvcgroup.in"
                    }
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {activeRole === "STUDENT" && "Default: student123"}
                    {activeRole === "FACULTY" && "Default: faculty123"}
                    {activeRole === "HOD" && "Default: hod123"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
                  activeRole === "STUDENT" ? "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30" :
                  activeRole === "FACULTY" ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30" :
                  "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                }`}
              >
                <span>{isLoading ? "Authenticating..." : `Sign In to ${activeRole} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Student Mode Switch Link */}
              {activeRole === "STUDENT" && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setStudentMode("REGISTER")}
                    className="text-xs text-zinc-400 hover:text-violet-400 transition-colors"
                  >
                    New student? <span className="underline font-semibold text-violet-400">Create New Account here</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Institutional Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-zinc-900 px-3 text-zinc-500 font-mono">Or Alternative Institutional Sign-In</span>
            </div>
          </div>

          {/* CONTINUE WITH GOOGLE SSO BUTTON */}
          <button
            type="button"
            onClick={handleContinueWithGoogle}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 hover:bg-zinc-800/90 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:border-zinc-600"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google Workspace</span>
          </button>

          {/* Quick Demo Fill Pills for Testing */}
          <div className="mt-5 pt-4 border-t border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 font-semibold mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Accounts (1-Click Fill):
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  handleRoleSelect("STUDENT");
                  setStudentMode("LOGIN");
                  setLoginIdentifier("25221A0501");
                  setPassword("student123");
                }}
                className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-[10px] text-zinc-300 font-mono border border-zinc-800 text-left cursor-pointer transition-colors"
                title="Student A. Surya Teja (CSE-A)"
              >
                <div className="font-bold text-violet-400">Student CSE</div>
                <div className="text-zinc-500 text-[9px] truncate">25221A0501</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRoleSelect("FACULTY");
                  setLoginIdentifier("faculty.java@bvcgroup.in");
                  setPassword("faculty123");
                }}
                className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-[10px] text-zinc-300 font-mono border border-zinc-800 text-left cursor-pointer transition-colors"
                title="Prof. Sharma (Java)"
              >
                <div className="font-bold text-indigo-400">Faculty Java</div>
                <div className="text-zinc-500 text-[9px] truncate">Prof. Sharma</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRoleSelect("HOD");
                  setLoginIdentifier("hod.cse@bvcgroup.in");
                  setPassword("hod123");
                }}
                className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-[10px] text-zinc-300 font-mono border border-zinc-800 text-left cursor-pointer transition-colors"
                title="Dr. B S N Murthy"
              >
                <div className="font-bold text-amber-400">HOD CSE</div>
                <div className="text-zinc-500 text-[9px] truncate">Dr. B S N Murthy</div>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-white/[0.08] bg-[#0c0d13]/80 py-4 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/bvc-logo.png" alt="BVCEC" className="w-5 h-5 object-contain opacity-70" />
            <span>Bonam Venkatachalam Engineering College, Odalarevu, Allavaram Mandal, Dr. B.R. Ambedkar Konaseema Dist, AP - 533210</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} BVCEC CODELAB • All Rights Reserved</span>
          </div>
        </div>
      </footer>

      {/* Google Fallback Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img src="/bvc-logo.png" alt="BVCEC" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Google Institutional Sign-In</h4>
                <p className="text-[11px] text-zinc-400">Connect with your BVC Workspace account</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Google Email</label>
                <input 
                  type="email" 
                  value={googleEmailInput} 
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="e.g. 25221A0501@bvcgroup.in" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={googleNameInput} 
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="e.g. A. Surya Teja" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="button"
                disabled={isGoogleSubmitting}
                onClick={() => handleGoogleDirectSubmit()}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-50 mt-2"
              >
                {isGoogleSubmitting ? "Connecting..." : "Authenticate via Google"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
