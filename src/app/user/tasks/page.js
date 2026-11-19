'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building,
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Award, 
  Terminal, 
  BookOpen, 
  Calendar, 
  User, 
  GraduationCap,
  Sparkles,
  Lock,
  RefreshCw,
  AlertTriangle,
  Printer,
  Eye,
  X,
  Code2,
  FileText
} from 'lucide-react';
import DigitalObservationPdfModal from '@/components/DigitalObservationPdfModal';

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [activePreviewObs, setActivePreviewObs] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfSubject, setPdfSubject] = useState('');

  const loadStudentTasks = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id') || '';
      const rollNumber = localStorage.getItem('bvcec-user-roll') || '';

      const res = await fetch(`/api/student/tasks?studentId=${studentId}&rollNumber=${rollNumber}`);
      const json = await res.json();

      if (json.success) {
        setTasks(json.tasks || []);
        if (json.student) setStudentInfo(json.student);
      }
    } catch (err) {
      console.error('Error fetching student tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentTasks();
  }, []);

  const subjects = ['ALL', ...Array.from(new Set(tasks.map(t => t.subject)))];

  const filteredTasks = selectedSubject === 'ALL' 
    ? tasks 
    : tasks.filter(t => t.subject === selectedSubject);

  const completedCount = tasks.filter(t => t.observation?.status === 'APPROVED' || t.observation?.status === 'EVALUATED').length;
  const pendingCount = tasks.filter(t => t.observation?.status === 'SUBMITTED_FOR_EVALUATION' || t.observation?.status === 'RESUBMITTED' || t.observation?.status === 'SUBMITTED').length;
  const correctionCount = tasks.filter(t => t.observation?.status === 'CORRECTION_REQUIRED').length;
  const notStartedCount = tasks.filter(t => !t.observation).length;
  const totalCount = tasks.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* College Institutional Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-[#0A0C14] to-indigo-950/70 border border-white/[0.08] p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-inner hidden sm:flex">
              <img 
                src="/bvc-logo.png" 
                alt="BVCEC Official Logo" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                  <Building className="w-3.5 h-3.5 text-violet-400" />
                  BVCEC CSE • Autonomous Digital Laboratory
                </span>
                <span className="text-xs text-zinc-300 font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                  {studentInfo?.section ? `Section: ${studentInfo.section}` : 'Section: CSE-A'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Academic Lab Experiments & Observations
              </h1>
              <p className="text-xs md:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                BONAM VENKATACHALAM ENGINEERING COLLEGE, ODALARAVU. Complete your laboratory programming assignments, verify compiler execution in Code Space, and submit authenticated digital observations directly to your assigned faculty.
              </p>
            </div>
          </div>

          <div className="bg-zinc-950/90 p-5 rounded-2xl border border-white/[0.08] text-center min-w-[160px] shadow-2xl backdrop-blur-md">
            <span className="text-xs text-zinc-400 block font-bold uppercase tracking-wider">Completion Rate</span>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1">
              {completionPercent}%
            </div>
            <div className="w-full bg-zinc-800/80 h-2 rounded-full mt-2 overflow-hidden p-0.5 border border-white/[0.05]">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all shadow-[0_0_10px_#10B981]"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1.5 block font-mono">
              {completedCount} of {totalCount} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Progress Tracking Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D0F17] border border-white/[0.06] shadow-lg hover:border-white/10 transition-colors">
          <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block">Total Assigned</span>
          <div className="text-2xl md:text-3xl font-black text-white mt-1">{totalCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Lab experiments</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] hover:border-emerald-500/50 transition-colors">
          <span className="text-[11px] text-emerald-300 uppercase font-bold tracking-wider block">Approved</span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{completedCount}</div>
          <p className="text-[11px] text-emerald-400/70 mt-1 font-mono">Evaluated by faculty</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:border-amber-500/50 transition-colors">
          <span className="text-[11px] text-amber-300 uppercase font-bold tracking-wider block">Pending Review</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{pendingCount}</div>
          <p className="text-[11px] text-amber-400/70 mt-1 font-mono">Submitted to faculty</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.08)] hover:border-rose-500/50 transition-colors">
          <span className="text-[11px] text-rose-300 uppercase font-bold tracking-wider block">Needs Correction</span>
          <div className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{correctionCount}</div>
          <p className="text-[11px] text-rose-400/70 mt-1 font-mono">Action required</p>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubject === subj
                  ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const targetSubj = selectedSubject !== 'ALL' ? selectedSubject : (subjects.find(s => s !== 'ALL') || 'Data Structures Lab');
              setPdfSubject(targetSubj);
              setIsPdfModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-all cursor-pointer"
            title="Generate multi-page printable digital observation book with faculty digital signatures"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Digital Observation PDF</span>
          </button>

          <button
            onClick={loadStudentTasks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-violet-400" />
            Subject Tasks Directory
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {filteredTasks.length} Experiments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Task / Experiment</th>
                <th className="py-3 px-4">Faculty Incharge</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Observation Status</th>
                <th className="py-3 px-4">Marks Awarded</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500">
                    Loading your assigned lab tasks...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500">
                    No tasks assigned for your section at this time.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const obs = t.observation;
                  const isApproved = obs?.status === 'APPROVED' || obs?.status === 'EVALUATED';
                  const isCorrection = obs?.status === 'CORRECTION_REQUIRED';
                  const isPending = obs?.status === 'SUBMITTED_FOR_EVALUATION' || obs?.status === 'RESUBMITTED' || obs?.status === 'SUBMITTED';
                  const isRejected = obs?.status === 'REJECTED';
                  const marks = obs?.facultyFinalMarks ?? obs?.marksAwarded;

                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{t.subject}</div>
                        <span className="text-[10px] font-mono text-violet-400">{t.subjectCode}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-violet-300">Exp {t.experimentNumber}</div>
                        <div className="text-zinc-200 font-medium">{t.title}</div>
                        <span className="text-[11px] text-zinc-500 font-mono uppercase">Lang: {t.language}</span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300 text-xs">
                        {t.facultyName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                        {new Date(t.closeTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {isCorrection && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Correction Required
                            </span>
                            {obs?.facultyRemarks && (
                              <div className="text-[11px] text-rose-300/90 mt-1 max-w-[200px] truncate" title={obs.facultyRemarks}>
                                Note: {obs.facultyRemarks}
                              </div>
                            )}
                          </div>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Under Evaluation
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-600/20 text-zinc-400 border border-zinc-700">
                            <AlertCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {!obs && (
                          <span className="text-xs text-zinc-500 italic">
                            Not Started
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {isApproved && marks !== null && marks !== undefined ? (
                          <span className="text-emerald-400 font-bold text-sm">
                            {marks} / 10
                          </span>
                        ) : isPending && obs?.aiRecommendedMarks !== null && obs?.aiRecommendedMarks !== undefined ? (
                          <span className="text-xs text-violet-300 font-mono" title="AI provisional recommendation">
                            AI: {obs.aiRecommendedMarks} / 10
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs italic">--</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isCorrection ? (
                            <Link
                              href={`/user/codespace?taskId=${t.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Fix in Codespace ➔</span>
                            </Link>
                          ) : isApproved ? (
                            <Link
                              href={`/user/codespace?taskId=${t.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)] active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View / Download</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/user/codespace?taskId=${t.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-95"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              <span>{obs ? 'Open in Codespace' : 'Take Task in Codespace ➔'}</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Observation PDF Export Modal */}
      <DigitalObservationPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        subjectName={pdfSubject || 'Computer Science Lab'}
        subjectCode={tasks.find(t => t.subject === pdfSubject)?.subjectCode || 'CSE-LAB'}
        student={studentInfo}
        facultyName={tasks.find(t => t.subject === pdfSubject)?.facultyName || 'Course Faculty In-Charge'}
        tasksWithObservations={tasks.filter(t => (pdfSubject ? t.subject === pdfSubject : true))}
      />
    </div>
  );
}
