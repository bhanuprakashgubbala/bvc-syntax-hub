'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  Layers,
  ArrowRight,
  CheckSquare,
  Square,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function HodAllocationsPage() {
  const [data, setData] = useState({
    allocations: [],
    faculties: [],
    subjects: [],
    sections: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // New allocation form state with multiple section checkboxes
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSections, setSelectedSections] = useState([]); // Array of sectionIds
  const [academicYear, setAcademicYear] = useState('2025-2026');

  // Load allocations data
  const loadAllocations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hod/allocations');
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.faculties?.length > 0 && !selectedFaculty) setSelectedFaculty(json.faculties[0].id);
        if (json.subjects?.length > 0 && !selectedSubject) setSelectedSubject(json.subjects[0].id);
        if (json.sections?.length > 0 && selectedSections.length === 0) {
          // Default: select the first section
          setSelectedSections([json.sections[0].id]);
        }
      }
    } catch (err) {
      console.error('Error fetching allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocations();
  }, []);

  // Toggle a section in the checkbox list
  const toggleSectionCheckbox = (secId) => {
    setSelectedSections(prev => 
      prev.includes(secId) 
        ? prev.filter(id => id !== secId) 
        : [...prev, secId]
    );
  };

  // Select all or deselect all sections
  const handleSelectAllSections = () => {
    if (selectedSections.length === data.sections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(data.sections.map(s => s.id));
    }
  };

  // Submit allocation using selected checkboxes
  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    if (!selectedFaculty || !selectedSubject) {
      setMessage({ type: 'error', text: 'Please select Faculty and Subject.' });
      return;
    }

    if (selectedSections.length === 0) {
      setMessage({ type: 'error', text: 'Please tick at least one Section checkbox (e.g. CSE-A, CSE-B).' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/hod/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty,
          subjectId: selectedSubject,
          sectionIds: selectedSections,
          academicYear
        })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: json.message || 'Faculty allocated to selected sections successfully!' });
        loadAllocations();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to create allocation.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Direct 1-Click Checkbox Matrix Toggle (Quick-allocation grid with Instant 0ms Optimistic UI)
  const handleMatrixCheckboxToggle = async (facultyId, subjectId, sectionId) => {
    // Optimistic UI update: Toggle locally immediately for lightning-fast responsiveness!
    setData(prev => {
      const isCurrentlyAllocated = prev.allocations.some(
        a => a.facultyId === facultyId && a.subjectId === subjectId && a.sectionId === sectionId
      );
      if (isCurrentlyAllocated) {
        return {
          ...prev,
          allocations: prev.allocations.filter(
            a => !(a.facultyId === facultyId && a.subjectId === subjectId && a.sectionId === sectionId)
          )
        };
      } else {
        const dummyAlloc = {
          id: `temp-${Date.now()}`,
          facultyId,
          subjectId,
          sectionId,
          academicYear,
          section: prev.sections.find(s => s.id === sectionId) || {},
          subject: prev.subjects.find(s => s.id === subjectId) || {},
          faculty: prev.faculties.find(f => f.id === facultyId) || {}
        };
        return {
          ...prev,
          allocations: [...prev.allocations, dummyAlloc]
        };
      }
    });

    try {
      const res = await fetch('/api/hod/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          facultyId,
          subjectId,
          sectionId,
          academicYear
        })
      });

      const json = await res.json();
      if (!json.success) {
        loadAllocations(); // Revert on error
      }
    } catch (err) {
      console.error('Matrix toggle error:', err);
      loadAllocations();
    }
  };

  const handleDeleteAllocation = async (id, facultyName, subjectName, sectionName) => {
    if (!confirm(`Are you sure you want to remove allocation of ${facultyName} for ${subjectName} (${sectionName})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/hod/allocations?id=${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Allocation deleted successfully.' });
        loadAllocations();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to delete allocation.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting allocation.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            Faculty & Section Allocation Management
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Assign faculty members to lab courses across sections using 1-click checkboxes. Multi-section allocations are supported.
          </p>
        </div>

        <button
          onClick={loadAllocations}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Alert */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Allocation Creation Form With Section Checkboxes */}
      <div className="p-6 rounded-xl bg-[#13131c] border border-violet-500/20 shadow-md space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-violet-400" />
            Assign Faculty to Labs via Section Checkboxes
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select faculty, choose lab subject, and tick the section checkboxes where this faculty will teach.
          </p>
        </div>

        <form onSubmit={handleCreateAllocation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  1. Select Faculty Member *
                </label>
                <Link
                  href="/hod/faculty"
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Register / Edit Faculty</span>
                </Link>
              </div>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                {data.faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} ({f.employeeId || f.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                2. Select Subject / Lab Course *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHECKBOX SECTION SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
                <span>3. Check the Target Sections to Assign (Tick Marks Indicate Allocation) *</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAllSections}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer underline"
              >
                {selectedSections.length === data.sections.length ? 'Deselect All' : 'Select All Sections'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.sections.map((sec) => {
                const isChecked = selectedSections.includes(sec.id);
                return (
                  <div
                    key={sec.id}
                    onClick={() => toggleSectionCheckbox(sec.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                      isChecked
                        ? 'bg-violet-950/40 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.25)] text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isChecked 
                          ? 'bg-violet-600 border-violet-500 text-white shadow-sm' 
                          : 'border-zinc-600 bg-zinc-800'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                          <span>{sec.name}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">({sec.semester})</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {sec._count?.students || 0} students enrolled
                        </p>
                      </div>
                    </div>

                    {isChecked && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        WILL ASSIGN
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || selectedSections.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs md:text-sm shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{submitting ? 'Allocating...' : `Assign to ${selectedSections.length} Checked Section(s)`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* QUICK ALLOCATION MATRIX (1-Click Interactive Checkboxes) */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Quick-Allocation Checkbox Matrix
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any checkbox to immediately assign or unassign that faculty member for that specific section.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            ● Live 1-Click Toggle Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Subject / Lab</th>
                {data.sections.map(s => (
                  <th key={s.id} className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
                      {s.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={2 + data.sections.length} className="py-8 text-center text-zinc-500">
                    Loading allocation matrix...
                  </td>
                </tr>
              ) : data.faculties.length === 0 ? (
                <tr>
                  <td colSpan={2 + (data.sections?.length || 3)} className="py-8 text-center text-zinc-500">
                    No faculty found.
                  </td>
                </tr>
              ) : (
                data.faculties.flatMap((f) => 
                  data.subjects.map((s) => (
                    <tr key={`${f.id}-${s.id}`} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-100">{f.fullName}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{f.employeeId || f.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-violet-300">{s.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block">{s.code}</span>
                      </td>

                      {/* Section Checkboxes */}
                      {data.sections.map((sec) => {
                        const isAllocated = data.allocations.some(
                          a => a.facultyId === f.id && a.subjectId === s.id && a.sectionId === sec.id
                        );

                        return (
                          <td key={sec.id} className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleMatrixCheckboxToggle(f.id, s.id, sec.id)}
                              className={`p-2 rounded-xl border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                                isAllocated
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                              }`}
                              title={isAllocated ? `Allocated to ${sec.name}. Click to remove.` : `Not allocated to ${sec.name}. Click to assign.`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                isAllocated ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-700 bg-zinc-800'
                              }`}>
                                {isAllocated && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-mono font-bold">
                                {sec.name}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Existing Allocations Directory Table */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              All Assigned Faculty Records
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Complete list of active faculty to section-subject allocations.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {data.allocations.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Faculty</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assigned Section</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Academic Period</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {data.allocations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">
                    No faculty allocations found. Use the checkboxes above to assign.
                  </td>
                </tr>
              ) : (
                data.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-100">{alloc.faculty?.fullName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {alloc.faculty?.employeeId ? `ID: ${alloc.faculty.employeeId}` : alloc.faculty?.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-violet-300">
                      <div>{alloc.subject?.name}</div>
                      <span className="text-[10px] font-mono text-zinc-400">{alloc.subject?.code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        <Check className="w-3 h-3 text-emerald-400" />
                        {alloc.section?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {alloc.section?._count?.students || 0} students
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">
                      {alloc.academicYear}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAllocation(
                          alloc.id, 
                          alloc.faculty?.fullName, 
                          alloc.subject?.name, 
                          alloc.section?.name
                        )}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
                        title="Remove Allocation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
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
