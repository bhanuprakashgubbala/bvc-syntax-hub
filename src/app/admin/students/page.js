"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Award, 
  Trash2, 
  Edit, 
  RotateCcw, 
  Download, 
  Building2, 
  GraduationCap, 
  Mail, 
  X,
  PlusCircle,
  MinusCircle
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Adjust Points Modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [pointsInput, setPointsInput] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          setStudents(data.users);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openPointsModal = (student) => {
    setEditingStudent(student);
    setPointsInput(student.totalPoints || 0);
  };

  const handleSavePoints = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingStudent.id,
          totalPoints: parseInt(pointsInput, 10)
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingStudent(null);
        fetchStudents();
      } else {
        alert(data.error || "Failed to update points.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete student account "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchStudents();
      } else {
        alert(data.error || "Failed to delete student.");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const exportCSV = () => {
    const headers = ["Name,Email,StudentId,Department,BatchYear,College,Points,CreatedDate"];
    const rows = filtered.map(s => 
      `"${s.fullName}","${s.email}","${s.studentId || ''}","${s.department || ''}","${s.batchYear || ''}","${s.college || ''}",${s.totalPoints || 0},"${new Date(s.createdAt).toISOString()}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `nextgen_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments = ["all", ...new Set(students.map(s => s.branchShort || s.department).filter(Boolean))];

  const filtered = students.filter(s => {
    const matchesDept = selectedDept === "all" || s.branchShort === selectedDept || s.department === selectedDept;
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Institutional Student Accounts
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage enrolled student rosters, edit points, and review activity logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID or email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {dept === "all" ? "All Departments" : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Register No</th>
                <th className="p-4">Department & Batch</th>
                <th className="p-4">Total Points</th>
                <th className="p-4">Submissions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    {loading ? "Loading registered students..." : "No students found."}
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-950/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/30">
                          {student.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 text-sm">{student.fullName}</p>
                          <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {student.studentId || "N/A"}
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300 font-medium block">{student.department}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Batch {student.batchYear || '2026'} • {student.college}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {student.totalPoints || 0} pts
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      {student.submissionCount || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPointsModal(student)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Edit Points
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.fullName)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Adjust Points Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-6 relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold text-zinc-50 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Adjust Student Points
              </h2>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
              <p className="font-semibold text-zinc-200">{editingStudent.fullName}</p>
              <p className="text-zinc-500 font-mono">{editingStudent.email} • {editingStudent.studentId}</p>
            </div>

            <form onSubmit={handleSavePoints} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 font-mono uppercase">
                  Total Points Balance
                </label>
                <input
                  type="number"
                  min={0}
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-lg font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Adjustment Shortcuts */}
              <div className="flex gap-2">
                {[+10, +50, +100, -50].map(delta => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setPointsInput(prev => Math.max(0, parseInt(prev || 0, 10) + delta))}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono font-bold text-xs cursor-pointer"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-amber-500/20"
                >
                  {isSaving ? "Saving..." : "Save Points"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
