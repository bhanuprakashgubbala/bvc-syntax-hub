"use client";

import { useState } from "react";
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
  X
} from "lucide-react";
import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";

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
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCertModal, setShowCertModal] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Zap className="w-6 h-6 text-violet-400" />
              Institutional Training Programs
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Industry-aligned cohort trainings with integrated live lecture video replays and certificates.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
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

            {/* 16:9 YouTube Video Container */}
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
    </div>
  );
}
