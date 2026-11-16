"use client";

import { useState, useEffect } from "react";
import { 
  Code2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  RotateCcw,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("Easy");
  const [formPoints, setFormPoints] = useState(10);
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchProblems = () => {
    setLoading(true);
    fetch("/api/admin/problems")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.problems) {
          setProblems(data.problems);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const openCreateModal = () => {
    setEditingProblem(null);
    setFormTitle("");
    setFormDifficulty("Easy");
    setFormPoints(10);
    setFormDescription(
`Given an input, return the result according to algorithmic rules.

**Example 1:**
Input: nums = [1, 2, 3]
Output: [3, 2, 1]`
    );
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setFormTitle(problem.title);
    setFormDifficulty(problem.difficulty);
    setFormPoints(problem.points);
    setFormDescription(problem.description);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      setErrorMsg("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isEdit = !!editingProblem;
      const url = "/api/admin/problems";
      const method = isEdit ? "PUT" : "POST";
      const body = {
        id: editingProblem?.id,
        title: formTitle,
        difficulty: formDifficulty,
        points: parseInt(formPoints, 10),
        description: formDescription
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsModalOpen(false);
        fetchProblems();
      } else {
        setErrorMsg(data.error || "Failed to save problem.");
      }
    } catch (err) {
      setErrorMsg("Network error saving problem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to permanently delete challenge "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/problems?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchProblems();
      } else {
        alert(data.error || "Failed to delete problem.");
      }
    } catch (e) {
      alert("Error deleting problem: " + e.message);
    }
  };

  const filtered = problems.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.difficulty.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-amber-400" />
            CodeArena Problems Manager
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Create, edit, and organize competitive coding challenges synced directly to SQLite.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProblems}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Challenge</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter problems by title or difficulty..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Problems Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Reward</th>
                <th className="p-4">Submissions</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    {loading ? "Loading challenges from database..." : "No challenges found."}
                  </td>
                </tr>
              ) : (
                filtered.map((prob) => (
                  <tr key={prob.id} className="hover:bg-zinc-950/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                        <span>{prob.title}</span>
                        <Link 
                          href={`/user/codearena/${prob.id}`} 
                          target="_blank"
                          className="text-zinc-500 hover:text-violet-400 transition-colors"
                          title="Preview in Student CodeArena"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">ID: {prob.id}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full font-semibold border ${getDifficultyColor(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {prob.points} pts
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      {prob._count?.submissions || 0}
                    </td>
                    <td className="p-4 font-mono text-zinc-500">
                      {new Date(prob.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prob)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prob.id, prob.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Delete"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 md:p-8 relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                {editingProblem ? "Edit Challenge" : "Create New CodeArena Challenge"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded-lg bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProblem} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider font-mono">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Valid Parentheses"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider font-mono">
                    Difficulty
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider font-mono">
                    Points Reward
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider font-mono">
                  Description & Examples (Markdown supported)
                </label>
                <textarea
                  rows={8}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Problem description, constraints, and test examples..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-amber-400 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingProblem ? "Update Challenge" : "Publish Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
