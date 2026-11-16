'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Award, 
  Download, 
  Printer, 
  Eye, 
  X,
  Code2,
  Terminal,
  Users,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Check,
  ChevronRight
} from 'lucide-react';

export default function HodSubmissionsPage() {
  const [data, setData] = useState({ 
    stats: { totalSubmissions: 0, evaluatedCount: 0, pendingCount: 0, correctionCount: 0 }, 
    facultyStats: [], 
    sectionStats: [], 
    observations: [] 
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [activeModalObs, setActiveModalObs] = useState(null);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hod/submissions');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const observations = data.observations || [];

  const filtered = observations.filter(obs => {
    const studentMatch = !searchTerm || 
      obs.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.experimentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const sectionMatch = sectionFilter === 'ALL' || obs.section?.name === sectionFilter;
    const facultyMatch = facultyFilter === 'ALL' || obs.facultyId === facultyFilter || obs.faculty?.fullName === facultyFilter;

    let statusMatch = true;
    if (statusFilter === 'PENDING') {
      statusMatch = ['SUBMITTED_FOR_EVALUATION', 'RESUBMITTED', 'SUBMITTED'].includes(obs.status);
    } else if (statusFilter === 'APPROVED') {
      statusMatch = ['APPROVED', 'EVALUATED'].includes(obs.status);
    } else if (statusFilter === 'CORRECTION_REQUIRED') {
      statusMatch = obs.status === 'CORRECTION_REQUIRED';
    } else if (statusFilter === 'REJECTED') {
      statusMatch = obs.status === 'REJECTED';
    }

    return studentMatch && sectionMatch && facultyMatch && statusMatch;
  });

  const uniqueSections = ['ALL', ...Array.from(new Set(observations.map(o => o.section?.name).filter(Boolean)))];
  const uniqueFaculties = ['ALL', ...Array.from(new Set(observations.map(o => o.faculty?.fullName).filter(Boolean)))];

  // Parse AI evaluation report safely
  const parsedAiReport = activeModalObs?.aiEvaluationReport 
    ? (typeof activeModalObs.aiEvaluationReport === 'string' ? JSON.parse(activeModalObs.aiEvaluationReport) : activeModalObs.aiEvaluationReport)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-violet-400" />
          Department Digital Lab Observations & Submissions
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Complete academic audit trail of laboratory experiments, faculty evaluation performance, and student submissions across the Department of Computer Science & Engineering.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#13131c] border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Total Submissions</span>
          <div className="text-2xl md:text-3xl font-black text-white mt-1">{data.stats?.totalSubmissions || 0}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Department-wide observations</p>
        </div>

        <div className="p-4 rounded-xl bg-[#13131c] border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs text-emerald-300 uppercase font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated & Approved
          </span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{data.stats?.evaluatedCount || data.stats?.approvedCount || 0}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Marks finalized by faculty</p>
        </div>

        <div className="p-4 rounded-xl bg-[#13131c] border border-amber-500/30 bg-amber-500/5">
          <span className="text-xs text-amber-300 uppercase font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending Evaluation
          </span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{data.stats?.pendingCount || 0}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Awaiting faculty review</p>
        </div>

        <div className="p-4 rounded-xl bg-[#13131c] border border-rose-500/30 bg-rose-500/5">
          <span className="text-xs text-rose-300 uppercase font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Correction Required
          </span>
          <div className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{data.stats?.correctionCount || 0}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Returned for revision</p>
        </div>
      </div>

      {/* Faculty Evaluation Performance Analytics */}
      {data.facultyStats && data.facultyStats.length > 0 && (
        <div className="rounded-xl bg-[#13131c] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              Faculty Evaluation Monitoring & Performance
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {data.facultyStats.length} Assigned Faculties
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.facultyStats.map(f => (
              <div key={f.facultyId} className="p-3.5 rounded-lg bg-[#181824] border border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white truncate">{f.facultyName}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Avg: {f.averageMarks}/10
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center text-xs pt-1">
                  <div className="bg-zinc-900 p-1.5 rounded">
                    <span className="text-[10px] text-zinc-500 block">Total</span>
                    <span className="font-bold text-white">{f.totalSubmissions}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block">Evaluated</span>
                    <span className="font-bold text-emerald-300">{f.approvedCount}</span>
                  </div>
                  <div className="bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 block">Pending</span>
                    <span className="font-bold text-amber-300">{f.pendingCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 bg-[#13131c] border border-zinc-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or experiment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-[#13131c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
          >
            {uniqueSections.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Sections' : `Section: ${s}`}</option>
            ))}
          </select>

          {/* Faculty Filter */}
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="bg-[#13131c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 max-w-[160px] truncate"
          >
            {uniqueFaculties.map(f => (
              <option key={f} value={f}>{f === 'ALL' ? 'All Faculties' : f}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#13131c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved / Evaluated</option>
            <option value="CORRECTION_REQUIRED">Correction Required</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" />
            All Student Lab Submissions ({filtered.length})
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            Total {observations.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Experiment</th>
                <th className="py-3 px-4">Assigned Faculty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Final Marks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-zinc-500">Loading department submissions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-zinc-500">No matching student observations found.</td>
                </tr>
              ) : (
                filtered.map((obs) => {
                  const isApproved = obs.status === 'APPROVED' || obs.status === 'EVALUATED';
                  const isCorrection = obs.status === 'CORRECTION_REQUIRED';
                  const isRejected = obs.status === 'REJECTED';
                  const isPending = ['SUBMITTED_FOR_EVALUATION', 'RESUBMITTED', 'SUBMITTED'].includes(obs.status);
                  const marks = obs.facultyFinalMarks ?? obs.marksAwarded;

                  return (
                    <tr key={obs.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{obs.student?.fullName}</div>
                        <div className="font-mono text-[11px] text-violet-400">{obs.student?.rollNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          {obs.section?.name || 'CSE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-200">
                        <div>{obs.subject?.name}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">{obs.subject?.code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-zinc-200">Exp {obs.experimentNumber}</span>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">{obs.experimentName}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-300">
                        {obs.faculty?.fullName || 'Assigned Faculty'}
                      </td>
                      <td className="py-3 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {isCorrection && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" /> Correction Req.
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-600/20 text-zinc-400 border border-zinc-700">
                            Rejected
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {obs.aiRecommendedMarks !== null && obs.aiRecommendedMarks !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            <Sparkles className="w-3 h-3" /> {obs.aiRecommendedMarks} / 10
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs italic">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {marks !== null && marks !== undefined ? (
                          <span className="text-emerald-400">{marks} / 10</span>
                        ) : (
                          <span className="text-zinc-500 text-xs italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setActiveModalObs(obs)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Record</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to view official laboratory observation record */}
      {activeModalObs && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 md:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12121c] border border-zinc-700 rounded-2xl max-w-4xl w-full p-5 md:p-6 space-y-5 max-h-[92vh] overflow-y-auto my-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-mono text-violet-400 font-bold block">
                  Bonam Venkatachalam Engineering College, Odalaravu • CSE Department
                </span>
                <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">Digital Laboratory Observation Record</h3>
              </div>
              <button
                onClick={() => setActiveModalObs(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Institutional Record Header */}
            <div className="bg-[#181824] p-3.5 rounded-xl border border-zinc-700/60 text-xs grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-zinc-500 block">Student Name:</span>
                <span className="font-semibold text-white">{activeModalObs.student?.fullName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Roll Number:</span>
                <span className="font-mono font-bold text-violet-300">{activeModalObs.student?.rollNumber}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Section & Dept:</span>
                <span className="text-zinc-200">{activeModalObs.section?.name || 'CSE-A'} • CSE</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Subject / Lab:</span>
                <span className="text-zinc-200">{activeModalObs.subject?.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Experiment No:</span>
                <span className="font-mono font-bold text-zinc-100">Exp {activeModalObs.experimentNumber}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Assigned Faculty:</span>
                <span className="text-zinc-200 font-semibold">{activeModalObs.faculty?.fullName || 'Faculty Incharge'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Marks Awarded:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {activeModalObs.facultyFinalMarks ?? activeModalObs.marksAwarded !== null ? `${activeModalObs.facultyFinalMarks ?? activeModalObs.marksAwarded} / 10` : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Evaluation Status:</span>
                <span className="font-bold text-violet-300">{activeModalObs.status}</span>
              </div>
            </div>

            {/* Observation Details */}
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">1. Aim of the Experiment:</h4>
                <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-200">
                  {activeModalObs.aim || 'N/A'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">2. Algorithm / Logic:</h4>
                <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-200 font-mono whitespace-pre-wrap text-xs">
                  {activeModalObs.algorithm || 'N/A'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-violet-400" />
                  3. Program Source Code:
                </h4>
                <pre className="p-3.5 rounded-lg bg-[#09090d] border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {activeModalObs.programCode}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  4. Actual Compiler Execution Output (Locked):
                </h4>
                <pre className="p-3.5 rounded-lg bg-[#09090d] border border-zinc-800 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {activeModalObs.executionOutput}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">5. Result / Verification:</h4>
                <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-200">
                  {activeModalObs.result || 'Program executed successfully and output verified.'}
                </div>
              </div>

              {/* AI Score & Faculty Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {activeModalObs.aiRecommendedMarks !== null && (
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <span className="text-[11px] text-violet-300 uppercase font-bold flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Recommended Score
                    </span>
                    <span className="font-mono font-bold text-lg text-violet-300">
                      {activeModalObs.aiRecommendedMarks} / 10
                    </span>
                  </div>
                )}

                {(activeModalObs.facultyRemarks || activeModalObs.feedback) && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[11px] text-amber-300 uppercase font-bold block mb-1">
                      Faculty Remarks & Feedback
                    </span>
                    <p className="text-xs text-amber-200 font-medium">
                      {activeModalObs.facultyRemarks || activeModalObs.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex justify-between items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Record</span>
              </button>
              <button
                onClick={() => setActiveModalObs(null)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
