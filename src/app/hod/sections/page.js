'use client';

import { useState, useEffect } from 'react';
import { 
  Layers, 
  Users, 
  Plus, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  BookOpen
} from 'lucide-react';

export default function HodSectionsPage() {
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    sectionId: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [secRes, stuRes] = await Promise.all([
        fetch('/api/hod/sections'),
        fetch('/api/hod/students' + (selectedSectionId ? `?sectionId=${selectedSectionId}` : ''))
      ]);
      const secJson = await secRes.json();
      const stuJson = await stuRes.json();

      if (secJson.success) setSections(secJson.sections || []);
      if (stuJson.success) setStudents(stuJson.students || []);

      if (secJson.sections?.length > 0 && !newStudent.sectionId) {
        setNewStudent(prev => ({ ...prev, sectionId: secJson.sections[0].id }));
      }
    } catch (err) {
      console.error('Error loading sections & students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSectionId]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.fullName || !newStudent.email || !newStudent.rollNumber || !newStudent.sectionId) {
      setMessage({ type: 'error', text: 'Please fill in all student details.' });
      return;
    }

    try {
      const res = await fetch('/api/hod/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `Student ${newStudent.fullName} enrolled successfully!` });
        setNewStudent({ fullName: '', email: '', rollNumber: '', sectionId: newStudent.sectionId });
        loadData();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to create student.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error enrolling student.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-violet-400" />
          Academic Sections & Student Directory
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Monitor sections (CSE-A, CSE-B, CSE-C), student enrollments, and academic distribution for Department of CSE.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Sections Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <div 
            key={sec.id}
            onClick={() => setSelectedSectionId(selectedSectionId === sec.id ? '' : sec.id)}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              selectedSectionId === sec.id 
                ? 'bg-violet-950/40 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.25)]' 
                : 'bg-[#13131c] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-violet-400 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                {sec.academicYear}
              </span>
              <span className="text-xs text-zinc-400">{sec.semester}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mt-3">{sec.name}</h3>
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-zinc-400">Total Enrolled:</span>
              <span className="font-bold text-violet-300 font-mono text-sm">
                {sec._count?.students || 0} Students
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-zinc-400">Assigned Faculty:</span>
              <span className="font-mono text-zinc-300">
                {sec.allocations?.length || 0} Courses
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Enroll Student Form */}
      <div className="p-6 rounded-xl bg-[#13131c] border border-zinc-800 shadow-md">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Plus className="w-4 h-4 text-violet-400" />
          Enroll New Student
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Add an individual student account with section and roll number.
        </p>

        <form onSubmit={handleCreateStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="e.g. M. Rajesh Kumar"
              value={newStudent.fullName}
              onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
              className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Roll Number</label>
            <input
              type="text"
              placeholder="e.g. 25221A0588"
              value={newStudent.rollNumber}
              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
              className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">College Email</label>
            <input
              type="email"
              placeholder="25221A0588@bvcgroup.in"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Section</label>
              <select
                value={newStudent.sectionId}
                onChange={(e) => setNewStudent({ ...newStudent, sectionId: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] h-[38px]"
            >
              Enroll
            </button>
          </div>
        </form>
      </div>

      {/* Students Table */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              Student Roster {selectedSectionId ? `(${sections.find(s => s.id === selectedSectionId)?.name || 'Filtered'})` : '(All Sections)'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Showing students registered under Computer Science & Engineering.
            </p>
          </div>
          {selectedSectionId && (
            <button
              onClick={() => setSelectedSectionId('')}
              className="text-xs text-violet-400 hover:underline"
            >
              Clear Section Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Assigned Section</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">No students enrolled yet.</td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-violet-300">
                      {st.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {st.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {st.section?.name || 'CSE-A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">
                      {st.email}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 text-xs">
                      {st.department || 'CSE'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      {st._count?.observations || 0} submitted
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

