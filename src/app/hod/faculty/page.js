'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Key, 
  Mail, 
  X, 
  Search, 
  Check, 
  Building,
  Upload,
  FileSpreadsheet,
  Download,
  FileText,
  FileCheck
} from 'lucide-react';

export default function HodFacultyPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  // Modal States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Bulk Upload State
  const [parsedFacultyList, setParsedFacultyList] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');

  // New Faculty Form State
  const [newFaculty, setNewFaculty] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    password: 'faculty123',
    department: 'Computer Science and Engineering'
  });

  // Edit Faculty Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    password: '',
    department: 'Computer Science and Engineering'
  });

  const loadFaculties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hod/faculty');
      const json = await res.json();
      if (json.success) {
        setFaculties(json.faculties || []);
      }
    } catch (err) {
      console.error('Error fetching faculties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculties();
  }, []);

  // Handle Bulk File Upload & Client Parsing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          setParsedFacultyList(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          setMessage({ type: 'error', text: 'Invalid JSON file format. Please upload valid JSON or CSV.' });
        }
      } else {
        // Parse CSV
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          setMessage({ type: 'error', text: 'CSV file is empty or only contains headers.' });
          return;
        }

        const list = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (row.length < 2 || !row[0]) continue;
          
          const fullName = row[0] || '';
          const email = row[1] || '';
          const employeeId = row[2] || '';
          const department = row[3] || 'Computer Science and Engineering';
          const password = row[4] || 'faculty123';
          
          list.push({ fullName, email, employeeId, department, password });
        }
        setParsedFacultyList(list);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Full Name,Email,Employee ID,Department,Password\n" +
      "Dr. P. V. Lakshmi,pv.lakshmi@bvcgroup.in,FAC-CSE-101,Computer Science and Engineering,faculty123\n" +
      "Prof. M. Venkatesh,m.venkatesh@bvcgroup.in,FAC-CSE-102,Computer Science and Engineering,faculty123\n" +
      "Prof. K. Satyanarayana,k.satya@bvcgroup.in,FAC-CSE-103,Computer Science and Engineering,faculty123\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bvcec_faculty_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = async () => {
    if (parsedFacultyList.length === 0) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/hod/faculty/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyList: parsedFacultyList })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: json.message });
        setIsBulkOpen(false);
        setParsedFacultyList([]);
        setBulkFileName('');
        loadFaculties();
      } else {
        setMessage({ type: 'error', text: json.error || 'Bulk upload failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error uploading faculty file.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Registration of New Faculty
  const handleRegisterFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.fullName.trim() || !newFaculty.email.trim()) {
      setMessage({ type: 'error', text: 'Faculty Name and Email are required.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/hod/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaculty)
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `Faculty ${newFaculty.fullName} registered successfully!` });
        setIsRegisterOpen(false);
        setNewFaculty({
          fullName: '',
          email: '',
          employeeId: '',
          password: 'faculty123',
          department: 'Computer Science and Engineering'
        });
        // Optimistic append then reload
        setFaculties(prev => [...prev, json.faculty]);
        loadFaculties();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to register faculty.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error registering faculty.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal with selected faculty data
  const handleOpenEdit = (faculty) => {
    setEditingFaculty(faculty);
    setEditForm({
      fullName: faculty.fullName || '',
      email: faculty.email || '',
      employeeId: faculty.employeeId || '',
      password: '',
      department: faculty.department || 'Computer Science and Engineering'
    });
    setIsEditOpen(true);
  };

  // Submit Edit Faculty Form
  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    if (!editingFaculty) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/hod/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFaculty.id,
          fullName: editForm.fullName,
          email: editForm.email,
          employeeId: editForm.employeeId,
          password: editForm.password,
          department: editForm.department
        })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `Faculty ${editForm.fullName} updated successfully!` });
        setIsEditOpen(false);
        // Optimistically update list
        setFaculties(prev => prev.map(f => f.id === editingFaculty.id ? { ...f, ...json.faculty } : f));
        loadFaculties();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to update faculty.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error updating faculty.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Faculty Member
  const handleDeleteFaculty = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from the department faculty roster? All active allocations will be cleaned up.`)) {
      return;
    }

    // Optimistic remove for instant responsiveness
    setFaculties(prev => prev.filter(f => f.id !== id));

    try {
      const res = await fetch(`/api/hod/faculty?id=${id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `Faculty member ${name} removed.` });
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to remove faculty.' });
        loadFaculties(); // Rollback if failed
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to server.' });
      loadFaculties();
    }
  };

  const filteredFaculties = faculties.filter(f => 
    f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.employeeId && f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            Faculty Registration & Directory Management
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Register new department faculty, edit profile details, update credentials, or remove accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs md:text-sm border border-zinc-700 hover:border-violet-500/50 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Bulk Upload Faculty (CSV)</span>
          </button>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs md:text-sm shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Faculty</span>
          </button>

          <button
            onClick={loadFaculties}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13131c] p-4 rounded-xl border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by faculty name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span>Total Faculty: <strong className="text-white font-bold">{faculties.length}</strong></span>
          <span>Showing: <strong className="text-violet-400">{filteredFaculties.length}</strong></span>
        </div>
      </div>

      {/* Faculty Directory Cards / Table */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            Registered Faculty Members (CSE)
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {faculties.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Allocated Courses & Sections</th>
                <th className="py-3 px-4">Created Tasks</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">
                    Loading faculty directory...
                  </td>
                </tr>
              ) : filteredFaculties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">
                    No faculty found matching search.
                  </td>
                </tr>
              ) : (
                filteredFaculties.map((f) => (
                  <tr key={f.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100">{f.fullName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>{f.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-violet-300">
                      {f.employeeId || 'N/A'}
                    </td>

                    <td className="py-3.5 px-4">
                      {f.allocations && f.allocations.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {f.allocations.map(a => (
                            <span 
                              key={a.id} 
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20"
                            >
                              {a.subject?.name} ({a.section?.name})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic text-xs">No active sections assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {f.createdTasks?.length || 0} tasks
                    </td>

                    <td className="py-3.5 px-4 text-xs text-zinc-300">
                      {f.department || 'CSE'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(f)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-700"
                          title="Edit Faculty Details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFaculty(f.id, f.fullName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                          title="Remove Faculty Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER NEW FACULTY MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#12121c] border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-400" />
                Register New Faculty Member
              </h3>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterFaculty} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. M. Suresh Kumar"
                  value={newFaculty.fullName}
                  onChange={(e) => setNewFaculty({ ...newFaculty, fullName: e.target.value })}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    placeholder="suresh@bvcgroup.in"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="FAC-CSE-105"
                    value={newFaculty.employeeId}
                    onChange={(e) => setNewFaculty({ ...newFaculty, employeeId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Default Password
                  </label>
                  <input
                    type="text"
                    value={newFaculty.password}
                    onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FACULTY DETAILS MODAL */}
      {isEditOpen && editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#12121c] border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                Edit Faculty Details: {editingFaculty.fullName}
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFaculty} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    New Password (Leave empty to keep unchanged)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter new password..."
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,119,6,0.3)] disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BULK UPLOAD MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#13131c] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsBulkOpen(false);
                setParsedFacultyList([]);
                setBulkFileName('');
              }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Bulk Register Faculty Members</h3>
                <p className="text-xs text-zinc-400">Upload a CSV or JSON file with faculty details for instant batch registration</p>
              </div>
            </div>

            {/* Template Download & Instructions */}
            <div className="mb-6 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">File Format Specification (CSV / Excel):</span>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-400 overflow-x-auto">
                <code>Full Name, Email, Employee ID, Department, Password</code>
              </div>
            </div>

            {/* File Upload Drop Area */}
            <div className="mb-6">
              <label className="block border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-zinc-950/40 hover:bg-violet-950/10">
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-zinc-200 block">
                  {bulkFileName ? `Selected: ${bulkFileName}` : 'Choose CSV, Excel or JSON file to upload'}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Click here or drag and drop your faculty roster file
                </span>
              </label>
            </div>

            {/* Parsed Preview Table */}
            {parsedFacultyList.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300">
                    Preview: {parsedFacultyList.length} Faculty Detected
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for upload
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-800 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Full Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Emp ID</th>
                        <th className="py-2 px-3">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      {parsedFacultyList.map((f, i) => (
                        <tr key={i} className="hover:bg-zinc-900/40">
                          <td className="py-2 px-3 text-zinc-500">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-zinc-200">{f.fullName}</td>
                          <td className="py-2 px-3 text-violet-400">{f.email}</td>
                          <td className="py-2 px-3 text-zinc-400">{f.employeeId || 'Auto'}</td>
                          <td className="py-2 px-3 text-zinc-500 truncate max-w-[120px]">{f.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsBulkOpen(false);
                  setParsedFacultyList([]);
                  setBulkFileName('');
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || parsedFacultyList.length === 0}
                onClick={handleBulkSubmit}
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {submitting ? 'Registering Faculty...' : `Confirm & Register (${parsedFacultyList.length} Faculty)`}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
