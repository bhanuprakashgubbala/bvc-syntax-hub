'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Layers, 
  FileCheck2, 
  BookOpen, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  AlertCircle,
  Building,
  GraduationCap
} from 'lucide-react';

export default function HodDashboardPage() {
  const [data, setData] = useState({
    allocations: [],
    faculties: [],
    sections: [],
    subjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/hod/allocations');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load HOD data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStudents = data.sections.reduce((acc, s) => acc + (s._count?.students || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/60 via-zinc-900 to-indigo-950/40 border border-violet-500/20 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Department Control Console
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome, Dr. B S N Murthy
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Bonam Venkatachalam Engineering College, Odalaravu — Computer Science and Engineering Department. Manage academic allocations, sections, digital laboratory records, and faculty assignments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/hod/allocations"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs md:text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Manage Allocations</span>
            </Link>
            <Link
              href="/hod/sections"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 font-medium text-xs md:text-sm border border-zinc-700 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Sections & Students</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Faculty Members</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{data.faculties?.length || 0}</div>
          <p className="text-xs text-zinc-500 mt-1">Teaching CSE Curriculum</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Sections</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{data.sections?.length || 0}</div>
          <p className="text-xs text-zinc-500 mt-1">CSE-A, CSE-B, CSE-C (IV Sem)</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Enrolled</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-violet-400">{totalStudents}</div>
          <p className="text-xs text-zinc-500 mt-1">Students across all sections</p>
        </div>

        <div className="p-5 rounded-xl bg-[#13131c] border border-zinc-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Allocations</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">{data.allocations?.length || 0}</div>
          <p className="text-xs text-zinc-500 mt-1">Subject-Section Faculty Pairs</p>
        </div>
      </div>

      {/* Faculty Allocation Overview Table */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              Current Faculty & Section Allocations (AY 2025-2026)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Only HOD can assign or reallocate faculty to particular subjects and sections.
            </p>
          </div>
          <Link
            href="/hod/allocations"
            className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
          >
            <span>Modify Allocations</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Assigned Section</th>
                <th className="py-3 px-4">Students in Section</th>
                <th className="py-3 px-4">Academic Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">
                    Loading allocations...
                  </td>
                </tr>
              ) : data.allocations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">
                    No faculty allocations created yet. Click "Modify Allocations" to add.
                  </td>
                </tr>
              ) : (
                data.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-100">{alloc.faculty?.fullName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{alloc.faculty?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-violet-300">
                      {alloc.subject?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      {alloc.subject?.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {alloc.section?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {alloc.section?._count?.students || 0} students
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">
                      {alloc.academicYear}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

