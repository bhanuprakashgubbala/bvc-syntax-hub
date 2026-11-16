'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Code2, 
  FileText,
  Lock,
  UploadCloud,
  FileCode,
  Download,
  Sparkles,
  Check,
  FileCheck,
  RefreshCw
} from 'lucide-react';

export default function FacultyTasksPage() {
  const [allocations, setAllocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [fileParseSuccess, setFileParseSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    allocationId: '',
    title: '',
    experimentNumber: '01',
    description: '',
    aim: '',
    instructions: '',
    language: 'java',
    starterCode: '',
    maxMarks: 20,
    openTime: '',
    closeTime: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const facultyId = localStorage.getItem('bvcec-user-id') || '';
      const [allocRes, taskRes] = await Promise.all([
        fetch(`/api/faculty/allocations?facultyId=${facultyId}`),
        fetch(`/api/faculty/tasks?facultyId=${facultyId}`)
      ]);

      const allocJson = await allocRes.json();
      const taskJson = await taskRes.json();

      if (allocJson.success) {
        setAllocations(allocJson.allocations || []);
        if (allocJson.allocations?.length > 0 && !formData.allocationId) {
          setFormData(prev => ({ ...prev, allocationId: allocJson.allocations[0].id }));
        }
      }
      if (taskJson.success) {
        setTasks(taskJson.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching tasks data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const toDatetimeLocal = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData(prev => ({
      ...prev,
      openTime: toDatetimeLocal(now),
      closeTime: toDatetimeLocal(nextWeek)
    }));

    loadData();
  }, []);

  // Intelligent File Content Parser for Lab Manual / Task Documents
  const parseTaskFileContent = (content, fileName = '') => {
    let parsed = {
      title: '',
      experimentNumber: '',
      aim: '',
      instructions: '',
      language: '',
      starterCode: '',
      maxMarks: null
    };

    // 1. Try parsing as JSON first
    if (fileName.endsWith('.json') || content.trim().startsWith('{')) {
      try {
        const json = JSON.parse(content);
        parsed.title = json.title || json.name || json.taskName || '';
        parsed.experimentNumber = json.experimentNumber || json.expNo || json.experimentNo || json.labNo || '';
        parsed.aim = json.aim || json.objective || '';
        parsed.instructions = json.instructions || json.description || json.algorithm || '';
        parsed.language = (json.language || json.lang || 'java').toLowerCase();
        parsed.starterCode = json.starterCode || json.code || json.program || '';
        parsed.maxMarks = json.maxMarks || json.marks || 20;

        return parsed;
      } catch (e) {
        // Fall through to text parsing
      }
    }

    // 2. Parse Text / Markdown / Lab Manual formatted files
    const lines = content.split('\n');

    // Extract Experiment Number
    const expNoMatch = content.match(/Experiment\s*(?:No\.?|Number)?\s*[:#-]?\s*([0-9A-Za-z]+)/i) ||
                       content.match(/Exp\s*(?:No\.?|#)?\s*[:#-]?\s*([0-9A-Za-z]+)/i);
    if (expNoMatch) {
      parsed.experimentNumber = expNoMatch[1].trim();
    }

    // Extract Title / Task Name
    const titleMatch = content.match(/(?:Title|Experiment Name|Task Name|Name)\s*[:#-]?\s*(.+)/i) ||
                      content.match(/Experiment\s*[0-9A-Za-z]+\s*[:#-]\s*(.+)/i);
    if (titleMatch) {
      parsed.title = titleMatch[1].replace(/[*#]/g, '').trim();
    }

    // Extract Aim
    const aimMatch = content.match(/(?:Aim|Objective)\s*[:#-]?\s*([\s\S]*?)(?=(?:Algorithm|Instructions|Program|Code|Input|Output|Procedure|###|$))/i);
    if (aimMatch) {
      parsed.aim = aimMatch[1].replace(/[*#]/g, '').trim();
    }

    // Extract Instructions / Algorithm / Description
    const instMatch = content.match(/(?:Instructions|Guidelines|Procedure|Algorithm|Description)\s*[:#-]?\s*([\s\S]*?)(?=(?:Program|Code|Starter Code|Input|Output|Aim|###|$))/i);
    if (instMatch) {
      parsed.instructions = instMatch[1].replace(/[*#]/g, '').trim();
    }

    // Extract Programming Language
    const langMatch = content.match(/(?:Language|Lang)\s*[:#-]?\s*(java|python|cpp|c\+\+|c|javascript|js)/i);
    if (langMatch) {
      let l = langMatch[1].toLowerCase();
      if (l === 'c++') l = 'cpp';
      if (l === 'js') l = 'javascript';
      parsed.language = l;
    } else {
      // Auto-detect from code patterns
      if (content.includes('public class') || content.includes('System.out.println')) parsed.language = 'java';
      else if (content.includes('def ') || content.includes('import ') && content.includes(':')) parsed.language = 'python';
      else if (content.includes('#include <stdio.h>')) parsed.language = 'c';
      else if (content.includes('#include <iostream>')) parsed.language = 'cpp';
    }

    // Extract Code / Starter Code (e.g. from code blocks ```code```)
    const codeBlockMatch = content.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      parsed.starterCode = codeBlockMatch[1].trim();
    } else {
      const codeMatch = content.match(/(?:Starter Code|Code|Program|Source Code)\s*[:#-]?\s*([\s\S]*?)(?=(?:###|Output|$))/i);
      if (codeMatch) {
        parsed.starterCode = codeMatch[1].trim();
      }
    }

    // Extract Max Marks
    const marksMatch = content.match(/(?:Max Marks|Total Marks|Marks)\s*[:#-]?\s*([0-9]+)/i);
    if (marksMatch) {
      parsed.maxMarks = parseInt(marksMatch[1], 10);
    }

    // If title was not found, use first non-empty line
    if (!parsed.title && lines.length > 0) {
      const firstLine = lines.find(l => l.trim().length > 0) || '';
      parsed.title = firstLine.replace(/^[#*\s-]+/, '').trim();
    }

    return parsed;
  };

  // Handle uploaded file (via file input or drag-and-drop)
  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (!content || typeof content !== 'string') {
        setMessage({ type: 'error', text: 'Unable to read file contents.' });
        return;
      }

      const parsed = parseTaskFileContent(content, file.name);

      // Auto-fill all manual form fields from parsed file
      setFormData(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        experimentNumber: parsed.experimentNumber || prev.experimentNumber,
        aim: parsed.aim || prev.aim,
        instructions: parsed.instructions || prev.instructions,
        language: parsed.language || prev.language,
        starterCode: parsed.starterCode || prev.starterCode,
        maxMarks: parsed.maxMarks || prev.maxMarks
      }));

      setFileParseSuccess({
        fileName: file.name,
        expNo: parsed.experimentNumber || formData.experimentNumber,
        title: parsed.title || 'Extracted Task',
        language: parsed.language || formData.language
      });

      setMessage({
        type: 'success',
        text: `File "${file.name}" loaded successfully! All form fields below have been automatically filled.`
      });
    };

    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Download Sample Template for Faculty
  const handleDownloadTemplate = () => {
    const templateContent = JSON.stringify({
      experimentNumber: "04",
      title: "Implementation of Binary Search Algorithm",
      language: "java",
      maxMarks: 20,
      aim: "To implement binary search algorithm on a sorted array and verify search operation.",
      instructions: "1. Accept array size and elements.\n2. Ensure array is sorted.\n3. Implement divide and conquer binary search.\n4. Print found index or -1 if element is absent.",
      starterCode: `import java.util.*;\n\npublic class Solution {\n    public static int binarySearch(int[] arr, int key) {\n        int low = 0, high = arr.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (arr[mid] == key) return mid;\n            if (arr[mid] < key) low = mid + 1;\n            else high = mid - 1;\n        }\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {10, 20, 30, 40, 50};\n        int key = 30;\n        int result = binarySearch(nums, key);\n        System.out.println("Element found at index: " + result);\n    }\n}`
    }, null, 2);

    const blob = new Blob([templateContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BVCEC_Lab_Manual_Task_Template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const facultyId = localStorage.getItem('bvcec-user-id');
    const selectedAlloc = allocations.find(a => a.id === formData.allocationId);

    if (!selectedAlloc) {
      setMessage({ type: 'error', text: 'You must select one of your HOD-allocated classes.' });
      return;
    }

    if (!formData.title || !formData.experimentNumber || !formData.openTime || !formData.closeTime) {
      setMessage({ type: 'error', text: 'Please fill in all required task fields.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/faculty/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: facultyId || selectedAlloc.facultyId,
          subjectId: selectedAlloc.subjectId,
          sectionId: selectedAlloc.sectionId,
          title: formData.title,
          experimentNumber: formData.experimentNumber,
          description: formData.description || formData.title,
          aim: formData.aim || `To write and execute ${formData.title} in ${formData.language.toUpperCase()}.`,
          instructions: formData.instructions || 'Execute the code cleanly, verify edge cases, and complete all observation sections.',
          language: formData.language,
          starterCode: formData.starterCode,
          maxMarks: formData.maxMarks,
          openTime: formData.openTime,
          closeTime: formData.closeTime
        })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `Task "Experiment ${formData.experimentNumber}: ${formData.title}" published successfully!` });
        setFileParseSuccess(null);
        setFormData(prev => ({
          ...prev,
          title: '',
          experimentNumber: String(parseInt(prev.experimentNumber || '1', 10) + 1).padStart(2, '0'),
          description: '',
          aim: '',
          instructions: '',
          starterCode: ''
        }));
        loadData();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to create task.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error creating task.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id, title) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    try {
      const facultyId = localStorage.getItem('bvcec-user-id') || '';
      const res = await fetch(`/api/faculty/tasks?id=${id}&facultyId=${facultyId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Task deleted successfully.' });
        loadData();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to delete task.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting task.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-indigo-400" />
          Create Coding & Digital Laboratory Tasks
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Upload tasks quickly from your lab manual file or type manually. File uploads automatically fill all task fields.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. UPLOAD TASK VIA FILE DROPZONE (AUTO-FILL FEATURE) */}
      <div className="p-6 rounded-2xl bg-[#13131e] border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 transition-all shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              Upload Task From Lab Manual File (Auto-Fill Form)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Avoid slow manual typing. Upload your experiment manual or task file (.json, .txt, .md, .csv) to auto-fill the form below.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer transition-colors"
            title="Download JSON/Text Template for Lab Tasks"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Template</span>
          </button>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging 
              ? 'bg-indigo-600/20 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
              : 'bg-zinc-950/60 border-zinc-800 hover:border-indigo-500/40 hover:bg-zinc-900/40'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".json,.txt,.md,.doc,.docx,.csv" 
            className="hidden" 
          />

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
            <FileCode className="w-6 h-6" />
          </div>

          <p className="text-sm font-bold text-zinc-100">
            Click to browse or drag and drop your Lab Manual file here
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Supports <strong className="text-indigo-300">.json, .txt, .md, .csv</strong> lab manual sheets. Automatically reads Title, Exp No, Aim, Instructions & Starter Code.
          </p>
        </div>

        {/* Extracted File Notification Card */}
        {fileParseSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                Auto-Filled From File: {fileParseSuccess.fileName}
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                Exp {fileParseSuccess.expNo}
              </span>
            </div>
            <p className="text-zinc-300">
              <strong>Title:</strong> {fileParseSuccess.title} | <strong>Language:</strong> {fileParseSuccess.language.toUpperCase()}
            </p>
            <p className="text-zinc-500 text-[11px]">
              You can review or fine-tune any field below before publishing the task to your students.
            </p>
          </div>
        )}
      </div>

      {/* 2. TASK CREATION FORM (MANUAL / AUTO-FILLED) */}
      <div className="p-6 rounded-xl bg-[#13131c] border border-zinc-800 shadow-md">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Task Details Form
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review auto-filled information or make manual adjustments before publishing.
            </p>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> HOD Allocation Enforced
          </span>
        </div>

        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                1. Target Assigned Class (Subject & Section) *
              </label>
              <select
                value={formData.allocationId}
                onChange={(e) => setFormData({ ...formData, allocationId: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {allocations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.subject?.name} — {a.section?.name} ({a.subject?.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                2. Experiment Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 01, 02, 03"
                value={formData.experimentNumber}
                onChange={(e) => setFormData({ ...formData, experimentNumber: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                3. Programming Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                4. Experiment Title / Task Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Experiment 01: Matrix Multiplication using 2D Arrays"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                5. Total Marks *
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value, 10) || 20 })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                6. Opening Date & Time (Submissions Begin) *
              </label>
              <input
                type="datetime-local"
                value={formData.openTime}
                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                7. Closing Date & Time (Deadline) *
              </label>
              <input
                type="datetime-local"
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              8. Experiment Aim & Question Statement
            </label>
            <textarea
              rows="3"
              placeholder="Aim of experiment (pre-fills student observation record aim)..."
              value={formData.aim}
              onChange={(e) => setFormData({ ...formData, aim: e.target.value })}
              className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              9. Task Instructions & Coding Guidelines
            </label>
            <textarea
              rows="3"
              placeholder="Instructions for student execution..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full bg-[#1b1b28] border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              10. Starter Code / Solution Scaffold (Optional)
            </label>
            <textarea
              rows="5"
              placeholder="Optional starter code or solution scaffold to pre-fill the student editor..."
              value={formData.starterCode}
              onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
              className="w-full bg-[#0a0a10] border border-zinc-700 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || allocations.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Creating Task...' : 'Publish Lab Task'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      <div className="rounded-xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Created Tasks & Laboratory Experiments
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {tasks.length} Tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Exp No</th>
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Subject & Section</th>
                <th className="py-3 px-4">Opening Time</th>
                <th className="py-3 px-4">Closing Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500">
                    No lab tasks created yet. Upload a lab manual file above to get started!
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      Exp {t.experimentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200">{t.subject?.name}</div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {t.section?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                      {new Date(t.openTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                      {new Date(t.closeTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.computedStatus === 'ACTIVE' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                      {t.computedStatus === 'UPCOMING' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          UPCOMING
                        </span>
                      )}
                      {t.computedStatus === 'CLOSED' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                          CLOSED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-300">
                      {t._count?.observations || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(t.id, t.title)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
