'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const [allocations, setAllocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyName, setFacultyName] = useState('Faculty Member');

  useEffect(() => {
    const name = localStorage.getItem('bvcec-user-name');
    const id = localStorage.getItem('bvcec-user-id');
    if (name) setFacultyName(name);

    async function loadData() {
      try {
        setLoading(true);
        const [allocRes, tasksRes, obsRes] = await Promise.all([
          fetch(`/api/faculty/allocations?facultyId=${id || ''}`),
          fetch(`/api/faculty/tasks?facultyId=${id || ''}`),
          fetch(`/api/faculty/observations?facultyId=${id || ''}`)
        ]);

        const [allocJson, tasksJson, obsJson] = await Promise.all([
          allocRes.json(),
          tasksRes.json(),
          obsRes.json()
        ]);

        if (allocJson.success) setAllocations(allocJson.allocations || []);
        if (tasksJson.success) setTasks(tasksJson.tasks || []);
        if (obsJson.success) setObservations(obsJson.observations || []);
      } catch (err) {
        console.error('Error loading faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const pendingObs = observations.filter(o => o.status !== 'EVALUATED').length;
  const evaluatedObs = observations.filter(o => o.status === 'EVALUATED').length;
  const activeTasks = tasks.filter(t => t.computedStatus === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-violet-950/50 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Department of CSE • Faculty Portal
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {facultyName}
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl">
              You have access to your HOD-allocated subjects and sections. Create coding tasks, review live compiler runs, and grade digital laboratory observations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/faculty/tasks"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs md:text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Lab Task</span>
            </Link>
            <Link
              href="/faculty/observations"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 font-medium text-xs md:text-sm border border-zinc-700 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Evaluate Observations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Assigned Sections</span>
          <div className="text-3xl font-black text-white mt-1">{allocations.length}</div>
          <p className="text-xs text-indigo-400 mt-1">HOD Allocations</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Active Lab Tasks</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{activeTasks}</div>
          <p className="text-xs text-zinc-500 mt-1">Currently open for submissions</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Pending Evaluation</span>
          <div className="text-3xl font-black text-amber-400 mt-1">{pendingObs}</div>
          <p className="text-xs text-zinc-500 mt-1">Submissions awaiting grading</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Evaluated Observations</span>
          <div className="text-3xl font-black text-violet-400 mt-1">{evaluatedObs}</div>
          <p className="text-xs text-zinc-500 mt-1">Observations completed</p>
        </div>
      </div>

      {/* Allocated Classes List */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              My HOD-Assigned Subjects & Sections
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strict access rule: You can only create tasks and review students for these assigned combinations.
            </p>
          </div>
          <Link href="/faculty/allocations" className="text-xs font-semibold text-indigo-400 flex items-center gap-1 hover:underline">
            <span>View Students</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allocations.length === 0 ? (
            <div className="col-span-full py-8 text-center text-zinc-500 text-sm">
              No subjects allocated by HOD yet.
            </div>
          ) : (
            allocations.map((alloc) => (
              <div key={alloc.id} className="p-4 rounded-xl bg-[#181824] border border-zinc-700/60 hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {alloc.section?.name}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">{alloc.academicYear}</span>
                </div>
                <h4 className="text-base font-bold text-white">{alloc.subject?.name}</h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Code: {alloc.subject?.code}</p>
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Class Strength:</span>
                  <span className="font-bold text-white font-mono">{alloc.section?._count?.students || 0} Students</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

