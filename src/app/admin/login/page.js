"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Server,
  Terminal,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState("credentials"); // 'credentials' | 'masterKey'
  const [email, setEmail] = useState("admin@nextgenlabs.co");
  const [password, setPassword] = useState("admin123");
  const [masterKey, setMasterKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = authMode === "credentials" 
        ? { email, password }
        : { masterKey };

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("nextgen-admin-token", data.token);
        localStorage.setItem("nextgen-admin-user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError(data.error || "Administrative authentication rejected.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Unable to reach administrative security gateway.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080B] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Return to Student Link */}
      <Link 
        href="/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 transition-colors z-20"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Student Portal</span>
      </Link>

      <div className="relative z-10 w-full max-w-md animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] mb-3">
            <img 
              src="/bvc-logo.png" 
              alt="BVCEC Official Logo" 
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
            Internal Operations Portal
          </span>
          <h1 className="text-2xl font-bold text-zinc-50 mt-1">BVCEC Administrator Portal</h1>
          <p className="text-xs text-zinc-400 mt-1">Bonam Venkatachalam Engineering College, Odalarevu</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Auth Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <button
              type="button"
              onClick={() => { setAuthMode("credentials"); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === "credentials"
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Credentials
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("masterKey"); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === "masterKey"
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Master Key
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === "credentials" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@nextgenlabs.co"
                      required
                      className="w-full bg-zinc-950/80 border border-zinc-700/80 text-white rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                      className="w-full bg-zinc-950/80 border border-zinc-700/80 text-white rounded-xl py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                  Master Security Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    placeholder="Enter root master key (e.g. NGL-ROOT-ADMIN-2026)"
                    required
                    className="w-full bg-zinc-950/80 border border-zinc-700/80 text-white rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">Default dev master key: <span className="text-amber-400/80">NGL-ROOT-ADMIN-2026</span></p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-xs uppercase tracking-wider font-mono"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Admin Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500 font-mono">
              Demo Credentials: <span className="text-zinc-300">admin@nextgenlabs.co</span> / <span className="text-zinc-300">admin123</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
