"use client";

import { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Search, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  Building2,
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Play, 
  X,
  BookOpen,
  FileText,
  Printer,
  Download,
  Terminal,
  Check,
  RefreshCw,
  Building,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";
import DigitalObservationPdfModal from "@/components/DigitalObservationPdfModal";

const INITIAL_TRAININGS = [
  {
    id: "tr-1",
    title: "Campus Placement Full Stack Boot Camp",
    cohort: "Cohort 2026",
    instructor: "Bhanu Prakash & Industry Mentors",
    department: "Computer Science & IT",
    status: "in-progress",
    duration: "12 Weeks",
    enrolledCount: 340,
    progress: 65,
    youtubeId: "ZVnjOPwW4VY",
    lectureTitle: "Full Stack Web Architecture Masterclass: Server Components, APIs & DB",
    milestones: ["HTML/CSS/JS Core", "React 19 & Next.js", "System Design & Cloud Sandbox", "Mock Technical Interviews"]
  },
  {
    id: "tr-2",
    title: "Data Structures & Competitive Problem Solving",
    cohort: "Advanced Track",
    instructor: "NextGen Labs Algorithms Team",
    department: "All Engineering Branches",
    status: "in-progress",
    duration: "8 Weeks",
    enrolledCount: 420,
    progress: 40,
    youtubeId: "8hly31xKli0",
    lectureTitle: "Comprehensive Data Structures & Algorithmic Problem Solving Workshop",
    milestones: ["Linear Structures", "Non-Linear Trees & Graphs", "Dynamic Programming", "CodeArena Contests"]
  },
  {
    id: "tr-3",
    title: "Cloud Infrastructure & DevOps Pipeline (AWS/GCP)",
    cohort: "Specialized Track",
    instructor: "SecOps Engineering",
    department: "CSE / ECE",
    status: "not-started",
    duration: "6 Weeks",
    enrolledCount: 180,
    progress: 0,
    youtubeId: "fqMOX6JJhGo",
    lectureTitle: "Docker, Kubernetes & CI/CD Pipelines Intensive Bootcamp",
    milestones: ["Linux Sandboxes", "Docker Containers", "CI/CD Workflows", "Kubernetes Clustering"]
  },
  {
    id: "tr-4",
    title: "Cyber Security & Ethical Hacking Essentials",
    cohort: "Cyber Track",
    instructor: "NextGen Labs Security Group",
    department: "CSE / AI&DS",
    status: "completed",
    duration: "4 Weeks",
    enrolledCount: 215,
    progress: 100,
    youtubeId: "3Kq1MIfTWCE",
    lectureTitle: "Ethical Hacking & Network Penetration Testing Hands-on Lecture",
    milestones: ["Reconnaissance", "Web App Pentesting", "Network Security", "CTF Flag Capture"]
  }
];

export default function TrainingsPage() {
  // Main View Section: 'observations' (Digital Lab Records & PDF) | 'bootcamps' (Industry Programs)
  const [mainSection, setMainSection] = useState("observations");

  // Industry Bootcamps State
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCertModal, setShowCertModal] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Digital Lab Observations State
  const [tasks, setTasks] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [pdfModalData, setPdfModalData] = useState({
    isOpen: false,
    subjectName: '',
    subjectCode: '',
    facultyName: '',
    tasks: []
  });

  const loadStudentTasks = async () => {
    try {
      setTasksLoading(true);
      const studentId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id') || '';
      const rollNumber = localStorage.getItem('bvcec-user-roll') || '';

      const res = await fetch(`/api/student/tasks?studentId=${studentId}&rollNumber=${rollNumber}`);
      const json = await res.json();

      if (json.success) {
        setTasks(json.tasks || []);
        if (json.student) setStudentInfo(json.student);
      }
    } catch (err) {
      console.error('Error fetching student tasks for observations:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadStudentTasks();
  }, []);

  // Group tasks by Lab / Subject (Students typically have 1 to 3 labs)
  const labGroups = tasks.reduce((acc, t) => {
    const subject = t.subject || 'Computer Science Lab';
    if (!acc[subject]) {
      acc[subject] = {
        name: subject,
        code: t.subjectCode || 'CS',
        faculty: t.facultyName || 'Assigned Faculty',
        tasks: []
      };
    }
    acc[subject].tasks.push(t);
    return acc;
  }, {});

  const labList = Object.values(labGroups);

  const toggleEnroll = (id) => {
    setTrainings(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === "not-started" ? "in-progress" : t.status;
        const newProgress = t.status === "not-started" ? 15 : t.progress;
        return { ...t, status: newStatus, progress: newProgress };
      }
      return t;
    }));
  };

  const filteredTrainings = trainings.filter(t => {
    const matchesTab = activeTab === "all" || t.status === activeTab;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenPdfForLab = (lab) => {
    setPdfModalData({
      isOpen: true,
      subjectName: lab.name,
      subjectCode: lab.code,
      facultyName: lab.faculty,
      tasks: lab.tasks
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Building className="w-6 h-6 text-violet-400" />
              <span>Training & Digital Lab Observations</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Subject-wise day-by-day laboratory records, verified faculty marks, and official digital observation PDF exports.
            </p>
          </div>
        </div>

        {/* Top Section Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit shrink-0">
          <button
            onClick={() => setMainSection("observations")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainSection === "observations"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Digital Lab Observations (PDF)</span>
          </button>

          <button
            onClick={() => setMainSection("bootcamps")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainSection === "bootcamps"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Industry Bootcamps</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: DIGITAL LAB OBSERVATIONS & PDF EXPORT         */}
      {/* ======================================================== */}
      {mainSection === "observations" && (
        <div className="space-y-6">
          
          {/* Institutional Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-[#0B0C14] to-indigo-950/70 border border-white/[0.08] p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 inline-flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  BVCEC Autonomous Digital Lab Record System
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white">
                  Student Digital Laboratory Observations (1 - 3 Allocated Labs)
                </h2>
                <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                  Track day-by-day experiment submissions, view faculty verified rubric marks (Aim, Algorithm, Compilation, Execution), and generate the official multi-page Digital Observation Book PDF for each subject.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={loadStudentTasks}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tasksLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Records</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subject / Lab Cards (1 to 3 Labs) */}
          {tasksLoading ? (
            <div className="p-12 text-center text-zinc-500 bg-[#0E1017] rounded-2xl border border-zinc-800 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-violet-400" />
              <span>Loading your laboratory observations...</span>
            </div>
          ) : labList.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 bg-[#0E1017] rounded-2xl border border-zinc-800">
              <BookOpen className="w-10 h-10 mx-auto text-zinc-600 mb-2 opacity-40" />
              <p className="text-sm font-semibold text-zinc-300">No laboratory tasks allocated yet.</p>
              <p className="text-xs text-zinc-500 mt-1">When faculty assigns experiments, your lab observations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {labList.map((lab, labIdx) => {
                const total = lab.tasks.length;
                const approvedCount = lab.tasks.filter(t => t.observation?.status === 'APPROVED' || t.observation?.status === 'EVALUATED').length;
                const submittedCount = lab.tasks.filter(t => t.observation?.status === 'SUBMITTED_FOR_EVALUATION' || t.observation?.status === 'RESUBMITTED').length;
                const percent = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

                return (
                  <div 
                    key={lab.name || labIdx}
                    className="bg-[#0D0F17] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl"
                  >
                    {/* Lab Card Header */}
                    <div className="p-5 md:p-6 bg-[#11131E] border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 shadow-inner">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              LAB {labIdx + 1} • {lab.code}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              Faculty: <strong className="text-zinc-200">{lab.faculty}</strong>
                            </span>
                          </div>
                          <h3 className="text-lg md:text-xl font-black text-white mt-1">
                            {lab.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                            <span>{total} Total Experiments</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{approvedCount} Approved & Signed</span>
                            <span>•</span>
                            <span>{percent}% Completed</span>
                          </div>
                        </div>
                      </div>

                      {/* PDF Download Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleOpenPdfForLab(lab)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-95"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Generate Subject Observation PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Day-by-Day Experiment Records Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-[#090A10] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                          <tr>
                            <th className="py-3 px-4 w-12 text-center">Exp</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Experiment Title & Aim</th>
                            <th className="py-3 px-4 text-center">Observation Status</th>
                            <th className="py-3 px-4 text-center">Faculty Rubric Marks</th>
                            <th className="py-3 px-4 text-center">Signature Seal</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-sans">
                          {lab.tasks.map((t, tIdx) => {
                            const obs = t.observation;
                            const marks = obs?.facultyFinalMarks ?? obs?.marksAwarded;
                            const isApproved = obs?.status === 'APPROVED' || obs?.status === 'EVALUATED';
                            const isPending = obs?.status === 'SUBMITTED_FOR_EVALUATION' || obs?.status === 'RESUBMITTED' || obs?.status === 'SUBMITTED';
                            const isCorrection = obs?.status === 'CORRECTION_REQUIRED';

                            // Parse rubric marks breakdown if available
                            let rubricInfo = null;
                            try {
                              if (obs?.aiEvaluationReport) {
                                const rep = typeof obs.aiEvaluationReport === 'string' ? JSON.parse(obs.aiEvaluationReport) : obs.aiEvaluationReport;
                                if (rep?.facultyEvaluation?.marksBreakdown) {
                                  rubricInfo = rep.facultyEvaluation.marksBreakdown;
                                }
                              }
                            } catch (e) {}

                            return (
                              <tr key={t.id || tIdx} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-200">
                                  #{t.experimentNumber || tIdx + 1}
                                </td>

                                <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                                  {obs?.date || new Date(t.openTime).toLocaleDateString()}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-white text-xs md:text-sm">
                                    {t.title}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                    {obs?.aim || t.aim || t.description}
                                  </p>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3 h-3" /> Approved
                                    </span>
                                  ) : isPending ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                      <Clock className="w-3 h-3" /> Submitted
                                    </span>
                                  ) : isCorrection ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                      <AlertTriangle className="w-3 h-3" /> Fix Needed
                                    </span>
                                  ) : (
                                    <span className="text-xs text-zinc-500 italic">Not Started</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-center font-mono">
                                  {isApproved && marks !== null && marks !== undefined ? (
                                    <div>
                                      <span className="text-emerald-400 font-extrabold text-sm block">
                                        {marks} / 10
                                      </span>
                                      {rubricInfo && (
                                        <span className="text-[9px] text-zinc-400 block mt-0.5">
                                          Aim:{rubricInfo.aim} | Algo:{rubricInfo.algorithm} | Comp:{rubricInfo.compilation} | Exec:{rubricInfo.execution}
                                        </span>
                                      )}
                                    </div>
                                  ) : isPending && obs?.aiRecommendedMarks ? (
                                    <span className="text-xs text-violet-300 font-mono">
                                      AI: {obs.aiRecommendedMarks} / 10
                                    </span>
                                  ) : (
                                    <span className="text-zinc-600 text-xs">--</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Signed</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-zinc-600 font-mono">Pending</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <Link
                                    href={`/user/codespace?taskId=${t.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-colors"
                                  >
                                    <Terminal className="w-3 h-3 text-violet-400" />
                                    <span>{obs ? 'Open' : 'Take'}</span>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: INDUSTRY BOOTCAMPS & PLACEMENT TRAININGS      */}
      {/* ======================================================== */}
      {mainSection === "bootcamps" && (
        <div className="space-y-6">
          {/* Sub Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Industry Bootcamps & Placement Tracks
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Curated industry bootcamps with integrated YouTube masterclasses and certificates.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bootcamps..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-zinc-800 pb-4 overflow-x-auto">
            {[
              { key: "all", label: "All Programs", count: trainings.length },
              { key: "in-progress", label: "In Progress", count: trainings.filter(t => t.status === "in-progress").length },
              { key: "completed", label: "Completed", count: trainings.filter(t => t.status === "completed").length },
              { key: "not-started", label: "Available to Enroll", count: trainings.filter(t => t.status === "not-started").length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Trainings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrainings.map((training) => (
              <div
                key={training.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-mono font-medium">
                      {training.cohort}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      training.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : training.status === 'in-progress'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {training.status === 'completed' ? 'Completed' : training.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-50 mb-1 leading-snug">{training.title}</h3>
                  <p className="text-xs text-zinc-400 mb-3">{training.instructor} • {training.department}</p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" /> {training.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-zinc-400" /> {training.enrolledCount} Students</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Curriculum Progress</span>
                      <span className="text-violet-400 font-bold">{training.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
                        style={{ width: `${training.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Bar with Video Masterclass Button */}
                <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveVideoModal(training)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span>Watch Lecture Video</span>
                  </button>

                  {training.status === 'completed' ? (
                    <button
                      onClick={() => setShowCertModal(training)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </button>
                  ) : training.status === 'in-progress' ? (
                    <Link
                      href="/user/courses"
                      className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-violet-600/30"
                    >
                      <span>Continue Curriculum</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleEnroll(training.id)}
                      className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded YouTube Lecture Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-bold text-zinc-50 text-sm">{activeVideoModal.title}</h3>
                  <p className="text-xs text-zinc-400">{activeVideoModal.lectureTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1.5 rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video border border-zinc-800 shadow-xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <span>Instructor: <strong className="text-zinc-200">{activeVideoModal.instructor}</strong></span>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-3xl p-8 relative shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs uppercase font-mono tracking-widest text-zinc-400">Certificate of Completion</p>
              <h2 className="text-2xl font-bold text-zinc-50 mt-1">NextGen Labs Institutional Honor</h2>
              <p className="text-sm text-zinc-300 mt-2">
                This certifies that the student has successfully completed the rigorous training program in
              </p>
              <p className="text-lg font-bold text-violet-400 mt-1">{showCertModal.title}</p>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-around text-xs font-mono text-zinc-400">
              <div>
                <p className="text-zinc-500">Issued On</p>
                <p className="text-zinc-200 font-bold">October 2026</p>
              </div>
              <div className="w-px h-8 bg-zinc-800"></div>
              <div>
                <p className="text-zinc-500">Verification ID</p>
                <p className="text-emerald-400 font-bold">NGL-CERT-8849</p>
              </div>
            </div>

            <button
              onClick={() => setShowCertModal(null)}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-violet-600/30 cursor-pointer"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

      {/* Digital Observation PDF Book Modal */}
      <DigitalObservationPdfModal
        isOpen={pdfModalData.isOpen}
        onClose={() => setPdfModalData(prev => ({ ...prev, isOpen: false }))}
        subjectName={pdfModalData.subjectName}
        subjectCode={pdfModalData.subjectCode}
        student={studentInfo}
        facultyName={pdfModalData.facultyName}
        tasksWithObservations={pdfModalData.tasks}
      />
    </div>
  );
}
