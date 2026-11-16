'use client';

import { useState, useEffect } from 'react';
import { Layers, Users, GraduationCap, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function FacultyAllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAlloc, setSelectedAlloc] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const facultyId = localStorage.getItem('bvcec-user-id') || '';
      const res = await fetch(`/api/faculty/allocations?facultyId=${facultyId}`);
      const json = await res.json();
      if (json.success && json.allocations?.length > 0) {
        setAllocations(json.allocations);
        setSelectedAlloc(json.allocations[0]);
      }
    } catch (err) {
      console.error('Error fetching faculty allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected allocation changes, load students in that section
  useEffect(() => {
    async function fetchStudents() {
      if (!selectedAlloc?.sectionId) return;
      try {
        const res = await fetch(`/api/hod/students?sectionId=${selectedAlloc.sectionId}`);
        const json = await res.json();
        if (json.success) {
          setStudents(json.students || []);
        }
      } catch (e) {
        console.error('Error fetching students:', e);
      }
    }
    fetchStudents();
  }, [selectedAlloc]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            My Assigned Classes & Student Roster
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            As mandated by the HOD, you are authorized to manage the following allocated sections and students.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Allocation Tabs */}
      <div className="flex flex-wrap gap-3">
        {allocations.map((alloc) => {
          const isSelected = selectedAlloc?.id === alloc.id;
          return (
            <button
              key={alloc.id}
              onClick={() => setSelectedAlloc(alloc)}
              className={`p-4 rounded-xl border text-left transition-all min-w-[220px] ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                  : 'bg-[#13131c] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-sm">{alloc.subject?.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {alloc.section?.name}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">{alloc.subject?.code} • {alloc.academicYear}</p>
              <div className="mt-2 text-xs text-indigo-300 font-medium">
                {alloc.section?._count?.students || 0} Students Enrolled
              </div>
            </button>
          );
        })}
      </div>

      {/* Student List */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Students in {selectedAlloc?.section?.name} ({selectedAlloc?.subject?.name})
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {students.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">
                    No students found in this section.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{st.rollNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{st.fullName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">{st.email}</td>
                    <td className="py-3.5 px-4 text-zinc-300 text-xs">{st.department || 'CSE'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {st.section?.name || selectedAlloc?.section?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      {st._count?.observations || 0} Submissions
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

