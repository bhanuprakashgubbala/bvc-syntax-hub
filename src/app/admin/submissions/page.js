"use client";

import { useState, useEffect } from "react";
import { 
  FileCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Code2, 
  RotateCcw, 
  X,
  Copy,
  Check
} from "lucide-react";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspectSubmission, setInspectSubmission] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchSubmissions = () => {
    setLoading(true);
    fetch("/api/admin/submissions")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.submissions) {
          setSubmissions(data.submissions);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = submissions.filter(s => {
    const matchesStatus = statusFilter === "all" || s.status.toLowerCase().includes(statusFilter);
    const matchesSearch = (s.user?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.problem?.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.language || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-amber-400" />
            Code Submissions & Sandbox Audit Log
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Review student code, test evaluations, sandbox execution timings, and verdicts.</p>
        </div>

        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh Log"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs font-semibold">Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, challenge, or language..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {["all", "accepted", "error"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase font-mono transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {st === "all" ? "All Verdicts" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Problem</th>
                <th className="p-4">Language</th>
                <th className="p-4">Verdict</th>
                <th className="p-4">Runtime</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4 text-right">Inspect Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500 font-mono">
                    {loading ? "Loading submissions log..." : "No submissions found."}
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-950/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-zinc-100 text-sm">{sub.user?.fullName || "Student"}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{sub.user?.studentId || sub.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-zinc-200">{sub.problem?.title || "Challenge"}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-mono uppercase text-[11px] text-zinc-300">
                        {sub.language}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${
                        sub.status === 'Accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {sub.status === 'Accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{sub.status}</span>
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      {sub.executionTimeMs} ms
                    </td>
                    <td className="p-4 font-mono text-zinc-500">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setInspectSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Review Code
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Inspection Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-zinc-50 text-base">
                  Submission Code Review: {inspectSubmission.problem?.title}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Submitted by {inspectSubmission.user?.fullName} ({inspectSubmission.user?.email})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCode(inspectSubmission.code)}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setInspectSubmission(null)}
                  className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded-lg bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Submission Code Box */}
            <div className="rounded-xl overflow-hidden border border-zinc-800">
              <div className="bg-zinc-950 px-4 py-2 text-xs font-mono text-zinc-500 border-b border-zinc-800 flex items-center justify-between">
                <span>Language: <strong className="uppercase text-zinc-300">{inspectSubmission.language}</strong></span>
                <span>Verdict: <strong className={inspectSubmission.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}>{inspectSubmission.status}</strong></span>
              </div>
              <pre className="p-4 bg-[#121217] text-zinc-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
                <code>{inspectSubmission.code}</code>
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectSubmission(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
