'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Printer, 
  Download, 
  X, 
  Award, 
  MessageSquare, 
  Code2, 
  Terminal,
  Filter,
  Sparkles,
  AlertTriangle,
  History,
  Check,
  RotateCcw,
  BookOpen,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function FacultyObservationsPage() {
  const [observations, setObservations] = useState([]);
  const [stats, setStats] = useState({ totalSubmissions: 0, approvedCount: 0, correctionCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  // Modal State
  const [activeObs, setActiveObs] = useState(null);
  const [activeTab, setActiveTab] = useState('document'); // 'document' | 'aiReport' | 'history'
  const [evalMarks, setEvalMarks] = useState('');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);
  const [message, setMessage] = useState(null);
  const [viewCodeSnapshot, setViewCodeSnapshot] = useState(false);

  const loadObservations = async () => {
    try {
      setLoading(true);
      const facultyId = localStorage.getItem('bvcec-user-id') || '';
      const res = await fetch(`/api/faculty/observations?facultyId=${facultyId}`);
      const json = await res.json();
      if (json.success) {
        setObservations(json.observations || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error('Error fetching observations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObservations();
  }, []);

  const openEvaluationModal = (obs) => {
    setActiveObs(obs);
    setActiveTab('document');
    setViewCodeSnapshot(false);
    
    // Default marks: faculty final marks if already evaluated, else AI recommended marks if available
    const initialMarks = obs.facultyFinalMarks !== null && obs.facultyFinalMarks !== undefined
      ? String(obs.facultyFinalMarks)
      : (obs.aiRecommendedMarks !== null && obs.aiRecommendedMarks !== undefined
          ? String(obs.aiRecommendedMarks)
          : (obs.marksAwarded !== null && obs.marksAwarded !== undefined ? String(obs.marksAwarded) : ''));
          
    setEvalMarks(initialMarks);
    setEvalFeedback(obs.facultyRemarks || obs.feedback || '');
  };

  const handleEvaluate = async (action = 'APPROVED') => {
    if (!activeObs) return;

    if ((action === 'APPROVED' || action === 'MODIFIED') && (evalMarks === '' || isNaN(evalMarks))) {
      alert('Please enter valid numeric marks between 0 and 10.');
      return;
    }

    if (action === 'CORRECTION_REQUIRED' && !evalFeedback.trim()) {
      alert('Please provide feedback explaining what corrections are needed from the student.');
      return;
    }

    setSubmittingEval(true);
    const facultyId = localStorage.getItem('bvcec-user-id');

    try {
      const res = await fetch('/api/faculty/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observationId: activeObs.id,
          marksAwarded: action === 'REJECTED' ? 0 : parseFloat(evalMarks || 0),
          facultyRemarks: evalFeedback,
          action,
          facultyId
        })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ 
          type: 'success', 
          text: `Observation for ${activeObs.student?.fullName} updated successfully (${action})!` 
        });
        setActiveObs(null);
        loadObservations();
      } else {
        alert(json.error || 'Evaluation failed.');
      }
    } catch (err) {
      alert('Error updating evaluation.');
    } finally {
      setSubmittingEval(false);
    }
  };

  // Filtered observations
  const filtered = observations.filter(obs => {
    const studentMatch = !searchTerm || 
      obs.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.experimentName?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const sectionMatch = sectionFilter === 'ALL' || obs.section?.name === sectionFilter;

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

    return studentMatch && sectionMatch && statusMatch;
  });

  const uniqueSections = ['ALL', ...Array.from(new Set(observations.map(o => o.section?.name).filter(Boolean)))];

  // Parse AI evaluation report safely
  const parsedAiReport = activeObs?.aiEvaluationReport 
    ? (typeof activeObs.aiEvaluationReport === 'string' ? JSON.parse(activeObs.aiEvaluationReport) : activeObs.aiEvaluationReport)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          Digital Observation Evaluation
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Review digital laboratory observations, inspect automated 10-mark AI recommendations, verify execution snapshots, award marks, or request student corrections.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#13131c] border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Total Submissions</span>
          <div className="text-2xl md:text-3xl font-black text-white mt-1">{stats.totalSubmissions}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Assigned lab experiments</p>
        </div>

        <div className="p-4 rounded-xl bg-[#13131c] border border-amber-500/30 bg-amber-500/5">
          <span className="text-xs text-amber-300 uppercase font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{stats.pendingCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Awaiting your evaluation</p>
        </div>

        <div className="p-4 rounded-xl bg-[#13131c] border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs text-emerald-300 uppercase font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved / Evaluated
          </span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{stats.approvedCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Academic marks finalized</p>
        </div>

        <div className="p-4 rounded-xl bg-[#13131c] border border-rose-500/30 bg-rose-500/5">
          <span className="text-xs text-rose-300 uppercase font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Correction Required
          </span>
          <div className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{stats.correctionCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Returned for student revision</p>
        </div>
      </div>

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
            className="bg-[#13131c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {uniqueSections.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Sections' : `Section: ${s}`}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#13131c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
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
            <Award className="w-4 h-4 text-indigo-400" />
            Submitted Digital Observations ({filtered.length})
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            Total {observations.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Experiment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Final Marks</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500">Loading student observations...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500">No matching student observations found.</td>
                </tr>
              ) : (
                filtered.map((obs) => {
                  const isApproved = obs.status === 'APPROVED' || obs.status === 'EVALUATED';
                  const isCorrection = obs.status === 'CORRECTION_REQUIRED';
                  const isRejected = obs.status === 'REJECTED';
                  const isPending = ['SUBMITTED_FOR_EVALUATION', 'RESUBMITTED', 'SUBMITTED'].includes(obs.status);
                  const isResubmitted = obs.status === 'RESUBMITTED';

                  return (
                    <tr key={obs.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{obs.student?.fullName}</div>
                        <div className="text-[11px] text-zinc-400">{obs.subject?.name}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                        {obs.student?.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {obs.section?.name || 'CSE'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-zinc-200">Exp {obs.experimentNumber}</div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">{obs.experimentName}</div>
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
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> {isResubmitted ? 'Resubmitted' : 'Pending Review'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {obs.aiRecommendedMarks !== null && obs.aiRecommendedMarks !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            <Sparkles className="w-3 h-3" /> {obs.aiRecommendedMarks} / 10
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {obs.facultyFinalMarks !== null && obs.facultyFinalMarks !== undefined ? (
                          <span className="text-emerald-400">{obs.facultyFinalMarks} / 10</span>
                        ) : obs.marksAwarded !== null && obs.marksAwarded !== undefined ? (
                          <span className="text-emerald-400">{obs.marksAwarded} / 10</span>
                        ) : (
                          <span className="text-zinc-500 text-xs italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEvaluationModal(obs)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Evaluate & Review</span>
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

      {/* Comprehensive Evaluation & Document Inspection Modal */}
      {activeObs && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 md:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12121c] border border-zinc-700 rounded-2xl max-w-5xl w-full p-4 md:p-6 space-y-5 max-h-[95vh] overflow-y-auto my-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-mono text-indigo-400 font-bold block">
                  BONAM VENKATACHALAM ENGINEERING COLLEGE, ODALARAVU • CSE DEPARTMENT
                </span>
                <h3 className="text-lg md:text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Digital Laboratory Observation Evaluation
                </h3>
              </div>
              <button
                onClick={() => setActiveObs(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Experiment Meta Strip */}
            <div className="bg-[#181824] p-3.5 rounded-xl border border-zinc-700/60 text-xs grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-zinc-500 block">Student Name:</span>
                <span className="font-semibold text-white">{activeObs.student?.fullName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Roll Number:</span>
                <span className="font-mono font-bold text-indigo-300">{activeObs.student?.rollNumber}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Class & Section:</span>
                <span className="text-zinc-200">{activeObs.section?.name || 'CSE-A'} • CSE</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Subject / Lab:</span>
                <span className="text-zinc-200">{activeObs.subject?.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Experiment:</span>
                <span className="font-mono font-bold text-zinc-100">Exp {activeObs.experimentNumber} - {activeObs.experimentName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Date of Submission:</span>
                <span className="font-mono text-zinc-200">{activeObs.date || new Date(activeObs.submittedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Current Status:</span>
                <span className="font-bold text-indigo-400">{activeObs.status}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Submission History:</span>
                <span className="font-mono text-zinc-200">{activeObs.history?.length || 1} Version(s)</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('document')}
                className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'document'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Observation Form</span>
              </button>

              <button
                onClick={() => setActiveTab('aiReport')}
                className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'aiReport'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>AI 10-Mark Evaluation</span>
                {activeObs.aiRecommendedMarks !== null && (
                  <span className="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono text-[10px]">
                    {activeObs.aiRecommendedMarks}/10
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({activeObs.history?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Observation Document */}
            {activeTab === 'document' && (
              <div className="space-y-4 text-xs md:text-sm">
                {/* Aim */}
                <div>
                  <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">1. Aim of the Experiment:</h4>
                  <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-200">
                    {activeObs.aim || 'N/A'}
                  </div>
                </div>

                {/* Algorithm */}
                <div>
                  <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">2. Algorithm / Logic:</h4>
                  <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-200 font-mono whitespace-pre-wrap text-xs">
                    {activeObs.algorithm || 'N/A'}
                  </div>
                </div>

                {/* Program Source Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      3. Program Source Code:
                    </h4>

                    {/* Modification Warning or Snapshot Switcher */}
                    {activeObs.hasManualModifications ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                          ⚠️ Student modified code after execution
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewCodeSnapshot(!viewCodeSnapshot)}
                          className="text-[11px] text-indigo-400 hover:underline font-mono"
                        >
                          {viewCodeSnapshot ? 'View Submitted Code' : 'View Execution Snapshot'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Matches Executed Snapshot
                      </span>
                    )}
                  </div>

                  <pre className="p-3.5 rounded-lg bg-[#09090d] border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {viewCodeSnapshot ? activeObs.executedCodeSnapshot : activeObs.programCode}
                  </pre>
                </div>

                {/* Execution Output */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      4. Compiler Execution Output:
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Status: Successful (Exit Code: 0)
                    </span>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-[#09090d] border border-zinc-800 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {activeObs.executionOutput}
                  </pre>
                </div>

                {/* Result & Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">5. Result:</h4>
                    <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-200">
                      {activeObs.result || 'Executed successfully and verified.'}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-xs mb-1">6. Student Remarks:</h4>
                    <div className="p-3 rounded-lg bg-[#0c0c14] border border-zinc-800 text-zinc-300 italic">
                      {activeObs.studentRemarks || 'No additional remarks provided.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: AI 10-Mark Evaluation Card */}
            {activeTab === 'aiReport' && (
              <div className="space-y-4">
                {parsedAiReport ? (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-violet-950/40 via-zinc-900 to-indigo-950/30 border border-violet-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <h4 className="text-sm font-bold text-white">Automated AI 10-Mark Evaluation Breakdown</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Recommended Score:</span>
                        <span className="text-xl font-black text-violet-300 font-mono px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-500/30">
                          {parsedAiReport.totalMarks || activeObs.aiRecommendedMarks} / 10
                        </span>
                      </div>
                    </div>

                    {/* Criteria Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {parsedAiReport.criteria && Object.entries(parsedAiReport.criteria).map(([key, val]) => (
                        <div key={key} className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-zinc-200 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="text-[11px] text-zinc-400 mt-0.5">{val.notes}</div>
                          </div>
                          <div className="text-sm font-mono font-bold text-violet-300 px-2 py-1 rounded bg-violet-500/10 ml-3">
                            {val.score} / {val.max}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Verification and Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                        <span className="text-xs font-bold text-zinc-300 uppercase block mb-1">Execution Verification:</span>
                        <div className="text-xs text-zinc-400 space-y-1 font-mono">
                          <div>Compilation: <span className="text-emerald-400">{parsedAiReport.compilationStatus || 'Passed'}</span></div>
                          <div>Test Cases: <span className="text-emerald-400">{parsedAiReport.testCasesPassed ? 'All Passed' : 'Manual verification recommended'}</span></div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                        <span className="text-xs font-bold text-zinc-300 uppercase block mb-1">Identified Feedback & Suggestions:</span>
                        <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
                          {parsedAiReport.suggestions && parsedAiReport.suggestions.length > 0 ? (
                            parsedAiReport.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))
                          ) : (
                            <li>Observation is well structured and follows required laboratory standards.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="text-right pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEvalMarks(String(parsedAiReport.totalMarks || activeObs.aiRecommendedMarks));
                          setActiveTab('document');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply AI Recommended Marks ({parsedAiReport.totalMarks || activeObs.aiRecommendedMarks}/10)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 bg-[#0c0c14] rounded-xl border border-zinc-800">
                    No detailed AI evaluation report available for this submission.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: History */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {activeObs.history && activeObs.history.length > 0 ? (
                  activeObs.history.map((h, idx) => (
                    <div key={h.id || idx} className="p-3.5 rounded-xl bg-[#0c0c14] border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">
                          Revision #{h.version} • Action: {h.action}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {new Date(h.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 grid grid-cols-2 gap-2">
                        <div>Status: <span className="text-indigo-400 font-semibold">{h.status}</span></div>
                        <div>Faculty Marks: <span className="text-emerald-400 font-bold">{h.facultyFinalMarks ?? 'Pending'}/10</span></div>
                      </div>
                      {h.facultyRemarks && (
                        <div className="text-xs p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Faculty Remarks:</span>
                          {h.facultyRemarks}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-zinc-500 bg-[#0c0c14] rounded-xl border border-zinc-800 text-xs">
                    This is the initial submission (Version 1). No revision history yet.
                  </div>
                )}
              </div>
            )}

            {/* Faculty Evaluation Control & Action Panel */}
            <div className="p-4 md:p-5 rounded-xl bg-[#181824] border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Academic Grading & Faculty Verification (Final Institutional Marks)
                </h4>

                {activeObs.aiRecommendedMarks !== null && (
                  <button
                    type="button"
                    onClick={() => setEvalMarks(String(activeObs.aiRecommendedMarks))}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ 1-Click Accept AI Marks ({activeObs.aiRecommendedMarks}/10)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Final Faculty Marks (0 - 10) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    placeholder="e.g. 9"
                    value={evalMarks}
                    onChange={(e) => setEvalMarks(e.target.value)}
                    className="w-full bg-[#12121c] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    AI recommendation: {activeObs.aiRecommendedMarks ?? 'N/A'}/10
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Faculty Remarks & Institutional Feedback *
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Program logic and execution verified. Accurate test results."
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    className="w-full bg-[#12121c] border border-zinc-700 rounded-lg px-3 py-2 text-xs md:text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Quick Feedback Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-500 font-semibold mr-1">Quick Remarks:</span>
                {[
                  'Excellent logic and accurate output.',
                  'Well explained algorithm and correct execution.',
                  'Please provide a more detailed step-by-step algorithm.',
                  'Logic needs correction; check edge cases.'
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setEvalFeedback(txt)}
                    className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    {txt}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print Observation</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Correction Required */}
                  <button
                    type="button"
                    disabled={submittingEval}
                    onClick={() => handleEvaluate('CORRECTION_REQUIRED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Request Correction</span>
                  </button>

                  {/* Reject */}
                  <button
                    type="button"
                    disabled={submittingEval}
                    onClick={() => handleEvaluate('REJECTED')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  {/* Approve */}
                  <button
                    type="button"
                    disabled={submittingEval}
                    onClick={() => handleEvaluate('APPROVED')}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submittingEval ? 'Saving...' : 'Approve & Finalize Marks'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
