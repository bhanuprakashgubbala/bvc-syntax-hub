"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { 
  FolderPlus, 
  FilePlus, 
  Search, 
  RefreshCw, 
  Minimize2, 
  Play, 
  FileCode2, 
  FolderOpen, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Maximize, 
  Minimize, 
  Terminal, 
  Clock, 
  Trash2, 
  Cpu, 
  GraduationCap, 
  Sparkles, 
  Bot, 
  Zap, 
  Lightbulb, 
  Send, 
  Copy, 
  Check, 
  Wrench, 
  FileText,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  ArrowLeft,
  Calendar,
  User,
  Building,
  X,
  ChevronUp,
  CheckCheck,
  Lock,
  ArrowRight,
  Activity,
  Server,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Braces,
  Code2,
  Printer,
  Download,
  AlertTriangle,
  History,
  FileCheck
} from 'lucide-react';
import AIChatDrawer from '@/components/AIChatDrawer';
import { analyzeCode } from '@/utils/codeAnalyzer';

const LANGUAGE_VERSIONS = {
  python: "3.10.15",
  javascript: "20.17.0",
  cpp: "13.2.0",
  c: "13.2.0",
  java: "22.0.0",
  typescript: "5.6.2",
  go: "1.23.1",
  rust: "1.81.0"
};

const LANGUAGE_DISPLAY_NAME = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  c: "C",
  java: "Java",
  typescript: "TypeScript",
  go: "Go",
  rust: "Rust"
};

const LANGUAGE_COLORS = {
  python: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", dot: "bg-blue-400" },
  java: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", dot: "bg-orange-400" },
  cpp: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", dot: "bg-cyan-400" },
  c: { text: "text-zinc-300", bg: "bg-zinc-500/10", border: "border-zinc-500/30", dot: "bg-zinc-400" },
  javascript: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  typescript: { text: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/30", dot: "bg-blue-300" },
  go: { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", dot: "bg-teal-400" },
  rust: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500" }
};

const COMPILER_SERVERS = [
  { id: "default", name: "Default Server", badge: "Primary Local", ping: "12ms", desc: "Isolated Docker Node", iconColor: "text-emerald-400" },
  { id: "onlinecompiler", name: "OnlineCompiler.io", badge: "Cloud Fast", ping: "45ms", desc: "Multi-Language Cloud", iconColor: "text-cyan-400" },
  { id: "jdoodle", name: "JDoodle Server", badge: "Production", ping: "110ms", desc: "Industrial Sandbox", iconColor: "text-amber-400" },
  { id: "codapi", name: "Codapi Server", badge: "Micro-VM", ping: "78ms", desc: "Sandboxed Web Runner", iconColor: "text-violet-400" },
  { id: "ce_judge", name: "CE.Judge Server", badge: "Judge Engine", ping: "90ms", desc: "ACM/ICPC Competitive", iconColor: "text-rose-400" }
];

const STDIN_PRESETS = [
  { label: "Single Number", value: "42" },
  { label: "Int Array (5 items)", value: "5\n10 20 30 40 50" },
  { label: "String Line", value: "Hello Nextgen Labs" },
  { label: "2D Matrix (3x3)", value: "3 3\n1 2 3\n4 5 6\n7 8 9" }
];

const DEFAULT_CODE = {
  python: "print('Hello Nextgen Labs!')\nfor i in range(5):\n    print(f'Count: {i}')",
  javascript: "console.log('Hello Nextgen Labs!');\n[1, 2, 3, 4, 5].forEach(n => console.log(`Count: ${n}`));",
  java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello Nextgen Labs!\");\n    for (int i = 0; i < 5; i++) {\n      System.out.println(\"Count: \" + i);\n    }\n  }\n}",
  cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello Nextgen Labs!\" << std::endl;\n    for (int i = 0; i < 5; ++i) {\n        std::cout << \"Count: \" << i << std::endl;\n    }\n    return 0;\n}",
  c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello Nextgen Labs!\\n\");\n    for (int i = 0; i < 5; ++i) {\n        printf(\"Count: %d\\n\", i);\n    }\n    return 0;\n}",
  typescript: "const message: string = 'Hello Nextgen Labs!';\nconsole.log(message);",
  go: "package main\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello Nextgen Labs!\")\n}",
  rust: "fn main() {\n    println!(\"Hello Nextgen Labs!\");\n}"
};

// Helper to guess language from extension
const getLanguageFromFilename = (filename) => {
  const f = filename.toLowerCase();
  if (f.endsWith('.py')) return 'python';
  if (f.endsWith('.js') || f.endsWith('.mjs')) return 'javascript';
  if (f.endsWith('.ts')) return 'typescript';
  if (f.endsWith('.java')) return 'java';
  if (f.endsWith('.cpp') || f.endsWith('.cc') || f.endsWith('.cxx')) return 'cpp';
  if (f.endsWith('.c')) return 'c';
  if (f.endsWith('.go')) return 'go';
  if (f.endsWith('.rs')) return 'rust';
  return 'python'; // Default
};

function CodespaceContent() {
  const searchParams = useSearchParams();
  const queryTaskId = searchParams?.get('taskId');

  // Academic Lab Task & Observation States
  const [activeTaskId, setActiveTaskId] = useState(queryTaskId || null);
  const [activeTask, setActiveTask] = useState(null);
  const [activeObservation, setActiveObservation] = useState(null);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [showTaskInstructions, setShowTaskInstructions] = useState(false);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationSuccess, setObservationSuccess] = useState(null);
  const [previewObservationMode, setPreviewObservationMode] = useState(false);

  // Digital Lab Observation Form Fields
  const [observationForm, setObservationForm] = useState({
    experimentName: '',
    aim: '',
    algorithm: '',
    programCode: '',
    executionOutput: '',
    result: '',
    studentRemarks: ''
  });

  // Immutable Execution Evidence Snapshot
  const [executedSnapshot, setExecutedSnapshot] = useState({
    code: '',
    output: '',
    language: '',
    exitCode: null,
    executionStatus: null
  });

  const [isExecutionSuccessful, setIsExecutionSuccessful] = useState(false);

  const [studentProfile, setStudentProfile] = useState({
    name: 'Student',
    rollNumber: '',
    section: 'CSE-A',
    email: ''
  });

  // File System State
  const [fileSystem, setFileSystem] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  // Editor State
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [exitCode, setExitCode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(13.5);
  const [isWordWrap, setIsWordWrap] = useState(true);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedOutput, setIsCopiedOutput] = useState(false);
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const editorRef = useRef(null);

  // Multi-Server Code Execution System (HOD-Upgradable & Dynamic)
  const [compilerServers, setCompilerServers] = useState(COMPILER_SERVERS);
  const [dynamicLanguages, setDynamicLanguages] = useState([]);
  const [dynamicDefaultCode, setDynamicDefaultCode] = useState(DEFAULT_CODE);
  const [dynamicLangNames, setDynamicLangNames] = useState(LANGUAGE_DISPLAY_NAME);
  const [dynamicLangVersions, setDynamicLangVersions] = useState(LANGUAGE_VERSIONS);
  const [dynamicLangColors, setDynamicLangColors] = useState(LANGUAGE_COLORS);

  const [compilerEngine, setCompilerEngine] = useState("default");
  const [autoFallback, setAutoFallback] = useState(true);
  const [lastEngineUsed, setLastEngineUsed] = useState("Default Server");
  const [engineMemory, setEngineMemory] = useState(null);

  // Fetch dynamic HOD Code Space configuration on mount
  useEffect(() => {
    const fetchDynamicConfig = async () => {
      try {
        const res = await fetch('/api/codespace/config');
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.servers) && data.servers.length > 0) {
            setCompilerServers(data.servers);
          }
          if (Array.isArray(data.languages) && data.languages.length > 0) {
            setDynamicLanguages(data.languages);
          }
          if (data.defaultCode) setDynamicDefaultCode(prev => ({ ...prev, ...data.defaultCode }));
          if (data.languageDisplayNames) setDynamicLangNames(prev => ({ ...prev, ...data.languageDisplayNames }));
          if (data.languageVersions) setDynamicLangVersions(prev => ({ ...prev, ...data.languageVersions }));
          if (data.languageColors) setDynamicLangColors(prev => ({ ...prev, ...data.languageColors }));
        }
      } catch (e) {
        console.warn("Using default compiler configuration:", e);
      }
    };
    fetchDynamicConfig();
  }, []);

  // Right Panel Console Tabs: 'output' | 'stdin' | 'diagnostics' | 'ai'
  const [rightPanelTab, setRightPanelTab] = useState("output");

  // AI Teaching Assistant & Socratic State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiSidebarMessages, setAiSidebarMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your **Code Space AI Professor**.\n\nWrite your program or click **Run**, and I will analyze your logic, explain errors, and provide Socratic hints without spoiling solutions!"
    }
  ]);
  const [aiSidebarInput, setAiSidebarInput] = useState("");
  const [isAiSidebarLoading, setIsAiSidebarLoading] = useState(false);
  const [isAiActionLoading, setIsAiActionLoading] = useState(false);
  const [aiNotification, setAiNotification] = useState("");

  // Modal State for File/Folder Creation
  const [modalState, setModalState] = useState({ isOpen: false, type: null }); // type: 'file' | 'folder'
  const [modalInput, setModalInput] = useState("");

  // Load Student Profile
  useEffect(() => {
    const storedName = localStorage.getItem('bvcec-user-name') || localStorage.getItem('nextgen-user-name') || 'Student';
    const storedEmail = localStorage.getItem('bvcec-user-email') || localStorage.getItem('nextgen-user-email') || '';
    const storedRoll = localStorage.getItem('bvcec-user-roll') || localStorage.getItem('nextgen-user-roll') || (storedEmail ? storedEmail.split('@')[0] : '25221A0501');
    const storedSection = localStorage.getItem('bvcec-user-section') || 'CSE-A';
    setStudentProfile({
      name: storedName,
      rollNumber: storedRoll,
      section: storedSection,
      email: storedEmail || `${storedRoll}@bvcgroup.in`
    });
  }, []);

  // Fetch Available Lab Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const userId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id') || '';
      const roll = localStorage.getItem('bvcec-user-roll') || '';
      try {
        const res = await fetch(`/api/student/tasks?studentId=${userId}&rollNumber=${roll}`);
        const data = await res.json();
        if (data.success && data.tasks) {
          setAvailableTasks(data.tasks);
        }
      } catch (err) {
        console.error("Failed to load tasks list", err);
      }
    };
    fetchTasks();
  }, []);

  // Sync with URL query param
  useEffect(() => {
    if (queryTaskId && queryTaskId !== activeTaskId) {
      setActiveTaskId(queryTaskId);
    }
  }, [queryTaskId]);

  // Load Task Details & Sync into Codespace
  useEffect(() => {
    if (!activeTaskId) {
      setActiveTask(null);
      setActiveObservation(null);
      setIsExecutionSuccessful(false);
      return;
    }

    const loadTaskDetails = async () => {
      setIsTaskLoading(true);
      const userId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id') || '';
      const roll = localStorage.getItem('bvcec-user-roll') || '';

      try {
        const res = await fetch(`/api/student/observation?taskId=${activeTaskId}&studentId=${userId}&rollNumber=${roll}`);
        const data = await res.json();
        if (data.success && data.task) {
          const t = data.task;
          setActiveTask(t);
          setActiveObservation(data.observation || null);

          // If student already saved/submitted this task, restore their saved work!
          if (data.observation) {
            setObservationForm({
              experimentName: data.observation.experimentName || t.title || '',
              aim: data.observation.aim || '',
              algorithm: data.observation.algorithm || '',
              programCode: data.observation.programCode || '',
              executionOutput: data.observation.executionOutput || '',
              result: data.observation.result || '',
              studentRemarks: data.observation.studentRemarks || ''
            });

            setExecutedSnapshot({
              code: data.observation.executedCodeSnapshot || data.observation.programCode || '',
              output: data.observation.executedOutputSnapshot || data.observation.executionOutput || '',
              language: data.observation.executedLanguage || t.language || 'java',
              exitCode: 0,
              executionStatus: data.observation.executionStatus || 'SUCCESS'
            });

            if (data.observation.executionOutput) {
              setOutput(data.observation.executionOutput);
              setIsExecutionSuccessful(true);
            }
          } else {
            // New uncompleted task: initialize blank
            setObservationForm({
              experimentName: t.title || '',
              aim: '',
              algorithm: '',
              programCode: '',
              executionOutput: '',
              result: '',
              studentRemarks: ''
            });
            setOutput('');
            setIsExecutionSuccessful(false);
          }

          // Normalize task language
          const rawLang = (t.language || 'java').toLowerCase();
          const normalizedLang = rawLang === 'c++' ? 'cpp' : (rawLang === 'c' ? 'c' : (rawLang === 'python' ? 'python' : (rawLang === 'javascript' ? 'javascript' : rawLang)));

          const extMap = {
            python: 'py',
            javascript: 'js',
            typescript: 'ts',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            go: 'go',
            rust: 'rs'
          };
          const ext = extMap[normalizedLang] || 'txt';
          const safeTitle = t.title ? t.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 'lab';
          const fileName = `exp_${t.experimentNumber || '01'}_${safeTitle}.${ext}`;

          // Code to use: restore saved code if exists, otherwise blank
          const codeToUse = data.observation?.programCode || '';

          // Inject task file into fileSystem
          const fileId = `task-file-${t.id}`;
          setFileSystem(prev => {
            const existing = getFileById(prev, fileId);
            if (existing) {
              return updateFileCode(prev, fileId, codeToUse);
            }
            const newTaskFile = {
              id: fileId,
              name: fileName,
              type: 'file',
              language: normalizedLang,
              code: codeToUse,
              lastOutput: data.observation?.executionOutput || '',
              lastStdin: ''
            };
            if (prev.length > 0 && prev[0].type === 'folder') {
              const updated = [...prev];
              updated[0].children = [newTaskFile, ...(updated[0].children || [])];
              return updated;
            }
            return [newTaskFile, ...prev];
          });

          setActiveFileId(fileId);
        }
      } catch (err) {
        console.error("Failed to load task details in Codespace", err);
      } finally {
        setIsTaskLoading(false);
      }
    };

    loadTaskDetails();
  }, [activeTaskId]);

  // Handle Saving Task Draft
  const handleSaveDraft = async () => {
    if (!activeTask) return;
    setIsSubmittingObservation(true);
    setObservationSuccess(null);

    const userId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id') || '';
    const roll = localStorage.getItem('bvcec-user-roll') || '';
    const email = localStorage.getItem('bvcec-user-email') || '';
    const activeCode = activeFile ? activeFile.code : (observationForm.programCode || '');
    const currentOutput = output || activeFile?.lastOutput || (observationForm.executionOutput || '');

    try {
      const res = await fetch('/api/student/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: activeTask.id,
          studentId: userId,
          rollNumber: roll,
          email: email,
          aim: observationForm.aim || '',
          algorithm: observationForm.algorithm || '',
          programCode: activeCode,
          executionOutput: currentOutput,
          result: observationForm.result || '',
          studentRemarks: observationForm.studentRemarks || '',
          executedCodeSnapshot: executedSnapshot.code || activeCode,
          executedOutputSnapshot: executedSnapshot.output || currentOutput,
          executedLanguage: activeFile?.language || activeTask.language,
          isDraft: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveObservation(data.observation);
        setObservationSuccess("💾 Draft saved! Your code, algorithm, and observation progress are safely preserved.");
      } else {
        alert(data.error || "Failed to save draft.");
      }
    } catch {
      alert("Network error saving draft.");
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  // Open Observation Modal with Execution Verification Guard
  const handleOpenObservationModal = () => {
    if (!activeTask) return;

    // If an observation was already submitted or evaluated, student can view anytime
    if (activeObservation && (activeObservation.status === 'APPROVED' || activeObservation.status === 'SUBMITTED_FOR_EVALUATION' || activeObservation.status === 'CORRECTION_REQUIRED')) {
      setIsObservationModalOpen(true);
      return;
    }

    // Strict execution validation: must execute successfully with non-empty output
    if (!isExecutionSuccessful || !output || output.trim().length === 0 || output.includes('❌') || output.includes('Error:') || output.includes('Exception')) {
      alert("⚠️ Execution Required:\n\nPlease compile and run your program successfully (Exit Code 0 with actual output) in Code Space before proceeding to the Digital Observation Form.");
      return;
    }

    // Auto-sync current code & output into observation form
    setObservationForm(prev => ({
      ...prev,
      programCode: activeFile?.code || prev.programCode,
      executionOutput: output || prev.executionOutput
    }));

    setIsObservationModalOpen(true);
  };

  // Handle Observation Submission to Assigned Faculty
  const handleSubmitObservation = async (e) => {
    if (e) e.preventDefault();
    if (!activeTask) return;

    const currentCode = observationForm.programCode || activeFile?.code || '';
    const currentOut = observationForm.executionOutput || output || '';

    if (!currentCode || !currentCode.trim()) {
      alert("Please ensure your program source code is present before submitting.");
      return;
    }

    if (!currentOut || !currentOut.trim() || currentOut.includes('⚠️ Click Run') || currentOut.includes('❌')) {
      alert("A verified successful compiler execution output is required before submitting to your faculty.");
      return;
    }

    if (!observationForm.aim || !observationForm.aim.trim()) {
      alert("Please enter the Aim of the experiment manually before submitting.");
      return;
    }

    if (!observationForm.algorithm || !observationForm.algorithm.trim()) {
      alert("Please enter the Algorithm / step-by-step logic manually before submitting.");
      return;
    }

    if (!observationForm.result || !observationForm.result.trim()) {
      alert("Please enter the Result & Conclusion manually before submitting.");
      return;
    }

    setIsSubmittingObservation(true);
    setObservationSuccess(null);

    const userId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id') || '';
    const roll = localStorage.getItem('bvcec-user-roll') || '';

    try {
      const res = await fetch('/api/student/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: activeTask.id,
          studentId: userId,
          rollNumber: roll,
          email: localStorage.getItem('bvcec-user-email') || '',
          aim: observationForm.aim,
          algorithm: observationForm.algorithm,
          programCode: currentCode,
          executionOutput: currentOut,
          result: observationForm.result,
          studentRemarks: observationForm.studentRemarks,
          executedCodeSnapshot: executedSnapshot.code || activeFile?.code || currentCode,
          executedOutputSnapshot: executedSnapshot.output || output || currentOut,
          executedLanguage: activeFile?.language || activeTask.language,
          executionStatus: 'SUCCESS',
          exitCode: 0,
          isDraft: false
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveObservation(data.observation);
        const aiScore = data.aiEvaluation?.totalMarks ?? data.observation?.aiRecommendedMarks;
        setObservationSuccess(`🎉 Observation submitted! Provisional AI Score: ${aiScore}/10. Forwarded to ${activeTask.faculty?.fullName || 'faculty'} for final review.`);
      } else {
        alert(data.error || "Failed to submit observation.");
      }
    } catch {
      alert("Network error submitting observation to faculty.");
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  // Refs for iframe and shortcuts
  const oneCompilerRef = useRef(null);
  const runCodeRef = useRef(null);
  const saveRef = useRef(null);

  // Load from Database on mount
  useEffect(() => {
    const fetchWorkspace = async () => {
      const userId = localStorage.getItem('nextgen-user-id');
      if (!userId) {
        initializeDefault();
        setIsLoaded(true);
        return;
      }

      try {
        const res = await fetch(`/api/workspace?userId=${userId}`);
        const data = await res.json();
        if (res.ok && data.success && data.workspaceData) {
          const parsed = JSON.parse(data.workspaceData);
          setFileSystem(parsed.fileSystem || []);
          setActiveFileId(parsed.activeFileId || null);
        } else {
          initializeDefault();
        }
      } catch (err) {
        console.error("Failed to fetch workspace", err);
        initializeDefault();
      } finally {
        setIsLoaded(true);
      }
    };
    fetchWorkspace();
  }, []);

  const initializeDefault = () => {
    setFileSystem([
      {
        id: "folder-1",
        name: "ADSC",
        type: "folder",
        isOpen: true,
        children: [
          { id: "file-1", name: "main.py", type: "file", language: "python", code: "print('Hello Nextgen Labs!')\nfor i in range(5):\n    print(f'Count: {i}')", lastOutput: "", lastStdin: "" }
        ]
      }
    ]);
    setActiveFileId("file-1");
  };

  // Auto-save workspace
  useEffect(() => {
    if (!isLoaded) return;
    
    const timeoutId = setTimeout(() => {
      const userId = localStorage.getItem('nextgen-user-id');
      if (userId) {
        let currentFS = fileSystem;
        if (activeFileId) {
          currentFS = currentFS.map(node => updateNodeExtras(node, activeFileId, stdin, output));
        }
        
        fetch('/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            workspaceData: { fileSystem: currentFS, activeFileId }
          })
        }).catch(err => console.error("Auto-save failed", err));
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [fileSystem, activeFileId, stdin, output, isLoaded]);

  const handleSave = async () => {
    setIsSaving(true);
    let currentFS = fileSystem;
    if (activeFileId) {
      currentFS = currentFS.map(node => updateNodeExtras(node, activeFileId, stdin, output));
      setFileSystem(currentFS);
    }
    
    const userId = localStorage.getItem('bvcec-user-id') || localStorage.getItem('nextgen-user-id');
    const roll = localStorage.getItem('bvcec-user-roll') || '';
    const email = localStorage.getItem('bvcec-user-email') || '';

    if (userId) {
      try {
        await fetch('/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            workspaceData: { fileSystem: currentFS, activeFileId }
          })
        });
      } catch (e) {
        console.error("Failed to save workspace to database", e);
      }
    }

    if (activeTask) {
      try {
        const activeCode = activeFile ? activeFile.code : '';
        const currentOutput = output || activeFile?.lastOutput || '';
        await fetch('/api/student/observation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: activeTask.id,
            studentId: userId,
            rollNumber: roll,
            email: email,
            aim: observationForm.aim || '',
            algorithm: observationForm.algorithm || '',
            programCode: activeCode,
            executionOutput: currentOutput,
            result: observationForm.result || '',
            studentRemarks: observationForm.studentRemarks || '',
            executedCodeSnapshot: executedSnapshot.code || activeCode,
            executedOutputSnapshot: executedSnapshot.output || currentOutput,
            isDraft: true
          })
        });
      } catch (e) {
        console.error("Failed to auto-save task draft", e);
      }
    }
    
    setTimeout(() => setIsSaving(false), 500);
  };

  saveRef.current = handleSave;

  const updateNodeExtras = (node, id, newStdin, newOutput) => {
    if (node.id === id) {
      return { ...node, lastStdin: newStdin, lastOutput: newOutput };
    }
    if (node.children) {
      return { ...node, children: node.children.map(child => updateNodeExtras(child, id, newStdin, newOutput)) };
    }
    return node;
  };

  const getFileById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = getFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllFiles = (nodes) => {
    let files = [];
    if (!nodes || !Array.isArray(nodes)) return files;
    for (const node of nodes) {
      if (node.type === 'file') {
        files.push(node);
      }
      if (node.children) {
        files = files.concat(getAllFiles(node.children));
      }
    }
    return files;
  };

  const activeFile = getFileById(fileSystem, activeFileId);
  const openFilesList = getAllFiles(fileSystem);

  const codeAnalysis = analyzeCode(
    activeFile ? activeFile.code : "", 
    activeFile ? LANGUAGE_DISPLAY_NAME[activeFile.language] || activeFile.language : "Python",
    null,
    output && (output.includes("❌") || output.includes("Error") || output.includes("STDERR")) ? { error: true } : (output ? { success: true } : null)
  );

  const handleFormatCode = () => {
    if (editorRef.current) {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
        setAiNotification("✨ Code formatted cleanly!");
        setTimeout(() => setAiNotification(""), 2500);
      } catch (e) {
        console.log("Format error", e);
      }
    }
  };

  const handleCopyCode = () => {
    if (activeFile?.code) {
      navigator.clipboard.writeText(activeFile.code);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    }
  };

  const handleCopyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopiedOutput(true);
      setTimeout(() => setIsCopiedOutput(false), 2000);
    }
  };

  const handleResetCode = () => {
    if (!activeFile) return;
    if (window.confirm(`Reset "${activeFile.name}" to default starter code template? Current edits in this file will be reset.`)) {
      const template = dynamicDefaultCode[activeFile.language] || DEFAULT_CODE[activeFile.language] || "// Start coding here";
      setFileSystem(prev => updateFileCode(prev, activeFile.id, template));
      setAiNotification("🔄 Reset code to starter template.");
      setTimeout(() => setAiNotification(""), 2500);
    }
  };

  const handleAskAiSidebar = async (customQuestion = null) => {
    const q = customQuestion || aiSidebarInput.trim();
    if (!q || isAiSidebarLoading) return;

    const userMsg = { sender: "user", text: q };
    setAiSidebarMessages(prev => [...prev, userMsg]);
    if (!customQuestion) setAiSidebarInput("");
    setIsAiSidebarLoading(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeFile ? activeFile.code : "",
          language: activeFile ? LANGUAGE_DISPLAY_NAME[activeFile.language] || activeFile.language : "Python",
          problemTitle: activeFile ? activeFile.name : "Codespace Project",
          problemDescription: `Student is coding in Codespace on file ${activeFile?.name || 'main'}.`,
          errorLogs: output && (output.includes("❌") || output.includes("Error") || output.includes("STDERR")) ? output : "",
          studentDoubt: q,
          socraticMode: true
        })
      });

      if (!res.ok) throw new Error("AI Assistant error");
      const data = await res.json();
      setAiSidebarMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "I analyzed your code. Let's look closer at your logic flow.",
          generatedCode: data.generatedCode || extractCodeSnippet(data.reply)
        }
      ]);
    } catch {
      setAiSidebarMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ **Professor Note:** Could not reach the server. Make sure your syntax is correct and try again!"
        }
      ]);
    } finally {
      setIsAiSidebarLoading(false);
    }
  };

  const extractCodeSnippet = (text) => {
    if (!text) return null;
    const match = text.match(/```(?:[a-zA-Z0-9_\-+]*\n)?([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const applyCodeToEditor = (newCode, notificationText = "✨ Code written to Code Pad!") => {
    if (!activeFileId || !newCode) return;
    setFileSystem(prev => updateFileCode(prev, activeFileId, newCode));
    setAiNotification(notificationText);
    setTimeout(() => {
      setAiNotification("");
    }, 4000);
  };

  const handleAiCodePadAction = async (actionType, customInstruction = "") => {
    if (!activeFile || isAiActionLoading) return;
    setIsAiActionLoading(true);
    setAiNotification("🤖 AI is analyzing and writing code...");

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeFile.code,
          language: LANGUAGE_DISPLAY_NAME[activeFile.language] || activeFile.language,
          problemTitle: activeFile.name,
          problemDescription: `Working on ${activeFile.name}`,
          errorLogs: output && (output.includes("❌") || output.includes("Error") || output.includes("STDERR")) ? output : "",
          studentDoubt: customInstruction || (
            actionType === "fix_code" ? "Fix any syntax or runtime errors and return runnable corrected code." :
            actionType === "optimize_code" ? "Optimize the code for best time and space complexity." :
            actionType === "add_comments" ? "Add clean educational comments to explain each step." :
            customInstruction
          ),
          action: actionType,
          socraticMode: false
        })
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      
      const newCode = data.generatedCode || extractCodeSnippet(data.reply);
      
      if (newCode) {
        applyCodeToEditor(newCode, 
          actionType === "fix_code" ? "✨ Fixed code applied to Code Pad!" :
          actionType === "optimize_code" ? "⚡ Optimized code applied to Code Pad!" :
          actionType === "add_comments" ? "📝 Educational comments added to Code Pad!" :
          "✨ AI updated Code Pad!"
        );
      } else {
        setAiNotification("ℹ️ AI provided advice. Check AI Professor panel.");
        setRightPanelTab("ai");
        setAiSidebarMessages(prev => [
          ...prev,
          { sender: "ai", text: data.reply || "Here is what I suggest for your code." }
        ]);
      }
    } catch {
      setAiNotification("⚠️ Failed to generate code. Please try again.");
      setTimeout(() => setAiNotification(""), 3500);
    } finally {
      setIsAiActionLoading(false);
    }
  };

  const updateFileCode = (nodes, id, newCode) => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, code: newCode };
      }
      if (node.children) {
        return { ...node, children: updateFileCode(node.children, id, newCode) };
      }
      return node;
    });
  };

  useEffect(() => {
    if (activeFile) {
      setStdin(activeFile.lastStdin || "");
      setOutput(activeFile.lastOutput || "");
      setExecutionTime(null);
      setExitCode(null);
    } else {
      setStdin("");
      setOutput("");
      setExecutionTime(null);
      setExitCode(null);
    }
  }, [activeFileId, activeFile?.lastStdin, activeFile?.lastOutput]);

  const handleEditorChange = (value) => {
    if (activeFileId) {
      setFileSystem(updateFileCode(fileSystem, activeFileId, value || ""));
    }
  };

  const EXTENSION_BY_LANG = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rs'
  };

  const isStarterOrEmptyCode = (code) => {
    if (!code || !code.trim()) return true;
    const trimmed = code.trim().replace(/\r\n/g, '\n');
    for (const val of Object.values({ ...DEFAULT_CODE, ...dynamicDefaultCode })) {
      if (val.trim().replace(/\r\n/g, '\n') === trimmed) return true;
    }
    return false;
  };

  const updateFileLanguage = (nodes, id, newLang) => {
    return nodes.map(node => {
      if (node.id === id) {
        const ext = EXTENSION_BY_LANG[newLang] || 'py';
        let newName = node.name || `main.${ext}`;
        if (newName.includes('.')) {
          const base = newName.substring(0, newName.lastIndexOf('.'));
          newName = `${base === 'main' && newLang === 'java' ? 'Main' : base}.${ext}`;
        } else {
          newName = `${newName}.${ext}`;
        }

        const shouldReplace = isStarterOrEmptyCode(node.code);
        const newCode = shouldReplace ? (dynamicDefaultCode[newLang] || DEFAULT_CODE[newLang] || node.code) : node.code;

        return { 
          ...node, 
          language: newLang,
          name: newName,
          code: newCode
        };
      }
      if (node.children) {
        return { ...node, children: updateFileLanguage(node.children, id, newLang) };
      }
      return node;
    });
  };

  const handleLanguageDropdownChange = (e) => {
    if (activeFileId) {
      setFileSystem(updateFileLanguage(fileSystem, activeFileId, e.target.value));
    }
  };

  const toggleFolder = (nodes, id) => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: toggleFolder(node.children, id) };
      }
      return node;
    });
  };

  const handleCreateFolder = () => {
    setModalState({ isOpen: true, type: 'folder' });
    setModalInput("");
  };

  const findParentFolder = (nodes, targetId, currentParent = null) => {
    for (const node of nodes) {
      if (node.id === targetId) return currentParent;
      if (node.children) {
        const found = findParentFolder(node.children, targetId, node);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCreateFile = () => {
    setModalState({ isOpen: true, type: 'file' });
    setModalInput("");
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const name = modalInput.trim();
    if (!name) {
      setModalState({ isOpen: false, type: null });
      return;
    }

    if (modalState.type === 'folder') {
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: name,
        type: "folder",
        isOpen: true,
        children: []
      };
      
      let updatedFS = [...fileSystem];
      let targetFolder = null;

      if (selectedFolderId) {
        targetFolder = getFileById(updatedFS, selectedFolderId);
      } else if (activeFileId) {
        targetFolder = findParentFolder(updatedFS, activeFileId);
      }

      if (targetFolder && targetFolder.type === "folder") {
        targetFolder.children.push(newFolder);
        targetFolder.isOpen = true;
      } else {
        updatedFS.push(newFolder);
      }

      setFileSystem(updatedFS);
      setSelectedFolderId(newFolder.id);
    } else if (modalState.type === 'file') {
      const lang = getLanguageFromFilename(name);
      const newFile = {
        id: `file-${Date.now()}`,
        name: name,
        type: "file",
        language: lang,
        code: dynamicDefaultCode[lang] || DEFAULT_CODE[lang] || "// Start coding here",
        lastOutput: "",
        lastStdin: ""
      };

      let updatedFS = [...fileSystem];
      let targetFolder = null;
      
      if (selectedFolderId) {
        targetFolder = getFileById(updatedFS, selectedFolderId);
      } else if (activeFileId) {
        targetFolder = findParentFolder(updatedFS, activeFileId);
      }

      if (targetFolder && targetFolder.type === "folder") {
        targetFolder.children.push(newFile);
        targetFolder.isOpen = true;
      } else {
        updatedFS.push(newFile);
      }
      
      setFileSystem(updatedFS);
      setActiveFileId(newFile.id);
    }

    setModalState({ isOpen: false, type: null });
  };

  // Multi-Server Code Execution Mechanism with Validation and Auto-Observation Trigger
  const handleRunCode = async () => {
    if (!activeFile || isRunning) return;

    setIsRunning(true);
    setOutput("");
    setExecutionTime(null);
    setExitCode(null);
    setRightPanelTab("output");

    const startTime = Date.now();

    try {
      let response;
      try {
        response = await fetch("/api/run_code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_id: activeFile.id,
            language: activeFile.language,
            code: activeFile.code,
            stdin: stdin,
            server: compilerEngine,
            autoFallback: autoFallback
          })
        });
      } catch {
        response = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: activeFile.language,
            code: activeFile.code,
            stdin: stdin,
            server: compilerEngine,
            autoFallback: autoFallback
          })
        });
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2) + "s";
      const data = await response.json().catch(() => ({}));

      const finalDuration = data.executionTime || elapsed;
      setExecutionTime(finalDuration);
      if (data.engine) {
        setLastEngineUsed(data.engine);
      }
      if (data.memory) {
        setEngineMemory(data.memory);
      }

      let finalOutputText = "";
      let executionSucceeded = false;
      const hasErrorFlags = Boolean(data.compile?.stderr || data.compileError || data.error || (data.exitCode !== undefined && data.exitCode !== 0));
      const computedExitCode = data.exitCode !== undefined ? data.exitCode : (data.success && !hasErrorFlags ? 0 : 1);

      if (data.run) {
        const stdout = data.run.stdout || "";
        const stderr = data.run.stderr || "";
        const runOutput = data.run.output || "";
        if (stderr && computedExitCode !== 0) {
          finalOutputText = runOutput || (stdout ? `${stdout}\n⚠️ STDERR:\n${stderr}` : stderr);
          executionSucceeded = false;
        } else if (stdout) {
          finalOutputText = (stderr && stderr.trim().length > 0) ? `${stdout}\n⚠️ STDERR:\n${stderr}` : stdout;
          executionSucceeded = computedExitCode === 0 && stdout.trim().length > 0;
        } else if (stderr) {
          finalOutputText = `⚠️ STDERR:\n${stderr}`;
          executionSucceeded = false;
        } else {
          finalOutputText = "⚠️ Program executed with no console output.";
          executionSucceeded = false; // Empty output is not treated as success
        }
      } else if (data.compile?.stderr) {
        finalOutputText = data.compile.output || `❌ Compilation Error:\n${data.compile.stderr}`;
        executionSucceeded = false;
      } else if (data.compileError) {
        finalOutputText = `❌ Compilation Error:\n${data.compileError}`;
        executionSucceeded = false;
      } else if (data.error) {
        finalOutputText = `❌ Error: ${data.error}`;
        executionSucceeded = false;
      } else if (data.output) {
        finalOutputText = data.output;
        executionSucceeded = computedExitCode === 0 && data.output.trim().length > 0 && !data.output.includes("❌");
      } else if (data.message) {
        finalOutputText = `⚐ ${data.message}`;
        executionSucceeded = false;
      } else {
        finalOutputText = "⚠️ No output generated.";
        executionSucceeded = false;
      }

      setOutput(finalOutputText);
      setExitCode(computedExitCode);
      setIsExecutionSuccessful(executionSucceeded);

      // AUTOMATIC DIGITAL OBSERVATION INTEGRATION
      if (executionSucceeded) {
        const currentCode = activeFile.code;
        setExecutedSnapshot({
          code: currentCode,
          output: finalOutputText,
          language: activeFile.language,
          exitCode: 0,
          executionStatus: 'SUCCESS'
        });

        // Automatically populate observation form
        setObservationForm(prev => ({
          ...prev,
          experimentName: activeTask ? (activeTask.title || prev.experimentName) : prev.experimentName,
          programCode: currentCode,
          executionOutput: finalOutputText
        }));

        // Automatically trigger Digital Observation Form for assigned tasks!
        if (activeTask) {
          setAiNotification("🎉 Program executed successfully (Exit Code 0)! Opening Digital Lab Observation Form...");
          setTimeout(() => {
            setIsObservationModalOpen(true);
          }, 800);
        }
      } else {
        if (activeTask) {
          setAiNotification("⚠️ Execution unsuccessful or empty output. Please fix errors and run again.");
          setTimeout(() => setAiNotification(""), 4500);
        }
      }
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2) + "s";
      setExecutionTime(elapsed);
      setExitCode(1);
      setIsExecutionSuccessful(false);
      setOutput(`❌ Error: ${error.message || "Failed to execute code"}`);
    } finally {
      setIsRunning(false);
    }
  };

  runCodeRef.current = handleRunCode;

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCodeRef.current?.();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recursive render of File Tree
  const renderTree = (nodes, depth = 0) => {
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return sortedNodes.map(node => {
      if (searchQuery && node.type === "file" && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }

      if (node.type === "folder") {
        const isSelected = selectedFolderId === node.id;
        return (
          <div key={node.id}>
            <div 
              className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'}`}
              style={{ paddingLeft: `${(depth * 12) + 8}px` }}
              onClick={() => {
                setFileSystem(toggleFolder(fileSystem, node.id));
                setSelectedFolderId(node.id);
              }}
            >
              {node.isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
              {node.isOpen ? <FolderOpen className="w-4 h-4 text-violet-400" /> : <Folder className="w-4 h-4 text-violet-400" />}
              <span className="font-semibold tracking-tight">{node.name}</span>
            </div>
            {node.isOpen && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      // File
      const isActive = activeFileId === node.id;
      const langColor = LANGUAGE_COLORS[node.language] || LANGUAGE_COLORS.python;

      return (
        <div 
          key={node.id}
          onClick={() => {
            setActiveFileId(node.id);
            setSelectedFolderId(null);
          }}
          className={`group flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${
            isActive 
              ? 'text-white bg-gradient-to-r from-violet-600/25 to-indigo-600/15 border border-violet-500/35 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
          style={{ paddingLeft: `${(depth * 12) + 22}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            <span className={`w-1.5 h-1.5 rounded-full ${langColor.dot}`} />
            <FileCode2 className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
            <span className="truncate">{node.name}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-600 uppercase group-hover:text-zinc-500">
            {node.language}
          </span>
        </div>
      );
    });
  };

  const activeLangConfig = dynamicLangColors[activeFile?.language] || LANGUAGE_COLORS[activeFile?.language] || LANGUAGE_COLORS.python;
  const activeServerConfig = compilerServers.find(s => s.id === compilerEngine) || compilerServers[0] || COMPILER_SERVERS[0];

  // Parse AI evaluation report if present
  let parsedAiReport = null;
  if (activeObservation?.aiEvaluationReport) {
    try {
      parsedAiReport = JSON.parse(activeObservation.aiEvaluationReport);
    } catch {
      parsedAiReport = null;
    }
  }

  // Check if student modified auto-populated program or output
  const isCodeModified = Boolean(executedSnapshot.code && observationForm.programCode && observationForm.programCode.trim() !== executedSnapshot.code.trim());
  const isOutputModified = Boolean(executedSnapshot.output && observationForm.executionOutput && observationForm.executionOutput.trim() !== executedSnapshot.output.trim());

  return (
    <div className="flex flex-col space-y-3 font-sans text-sm selection:bg-violet-500/30">
      {/* Hidden OneCompiler Embed Bridge */}
      <iframe 
        ref={oneCompilerRef}
        id="onecompiler-iframe" 
        src="https://onecompiler.com/embed?listenToEvents=true&codeChangeEvent=true&version=v1" 
        title="OneCompiler Engine"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          border: "none",
          visibility: "hidden"
        }}
      />

      {/* Modal for File/Folder Creation */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/75 z-[10000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#10121a] border border-violet-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-zinc-800 bg-[#141622] flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                {modalState.type === 'folder' ? <FolderPlus className="w-4 h-4 text-violet-400" /> : <FilePlus className="w-4 h-4 text-violet-400" />}
                <span>Create New {modalState.type === 'folder' ? 'Folder' : 'Source File'}</span>
              </h3>
              <button 
                onClick={() => setModalState({ isOpen: false, type: null })}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {modalState.type === 'folder' ? 'Folder Name' : 'File Name (e.g. solution.py, Main.java, test.cpp)'}
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder={modalState.type === 'folder' ? 'e.g., Data Structures' : 'e.g., solution.py, Main.java'}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono transition-all"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, type: null })}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modalInput.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
                >
                  Create {modalState.type === 'folder' ? 'Folder' : 'File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Alert Banner */}
      {observationSuccess && (
        <div className="p-3.5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-emerald-950/30 text-emerald-300 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{observationSuccess}</span>
          </div>
          <button 
            onClick={() => setObservationSuccess(null)}
            className="text-xs text-emerald-400 hover:text-white font-mono px-2 py-0.5 rounded hover:bg-emerald-500/20 cursor-pointer"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ACADEMIC LAB TASK PRO HEADER BANNER (WHEN ACTIVE) */}
      {activeTask ? (
        <div className="rounded-2xl bg-gradient-to-r from-[#121324] via-[#0E1019] to-[#121526] border border-violet-500/35 p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <Link 
                href="/user/tasks"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                title="Return to Tasks Directory"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-violet-400" />
                <span>All Tasks</span>
              </Link>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/35 font-mono shadow-sm flex items-center gap-1.5">
                <Building className="w-3 h-3 text-violet-400" />
                BVCEC CSE • Exp {activeTask.experimentNumber}
              </span>

              {/* Task Selector Dropdown */}
              {availableTasks.length > 0 && (
                <div className="flex items-center gap-1.5 bg-zinc-950/90 px-2.5 py-1 rounded-xl border border-zinc-800 text-xs shadow-sm">
                  <ListTodo className="w-3.5 h-3.5 text-violet-400" />
                  <select 
                    value={activeTaskId || ''}
                    onChange={(e) => setActiveTaskId(e.target.value || null)}
                    className="bg-transparent text-xs text-zinc-200 font-semibold focus:outline-none cursor-pointer max-w-[210px] truncate"
                  >
                    {availableTasks.map(t => (
                      <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-200">
                        Exp {t.experimentNumber}: {t.title} ({t.subject})
                      </option>
                    ))}
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      -- Free Workspace (No Task) --
                    </option>
                  </select>
                </div>
              )}

              {/* Observation Pipeline Status Badge */}
              {activeObservation?.status === 'APPROVED' || activeObservation?.status === 'EVALUATED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Approved by Faculty: {activeObservation.facultyFinalMarks ?? activeObservation.marksAwarded} / {activeTask.maxMarks || 10} Marks
                </span>
              ) : activeObservation?.status === 'CORRECTION_REQUIRED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Correction Required by Faculty
                </span>
              ) : activeObservation?.status === 'RESUBMITTED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  Resubmitted (Pending Review)
                </span>
              ) : activeObservation?.status === 'SUBMITTED_FOR_EVALUATION' || activeObservation?.status === 'SUBMITTED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                  <CheckCheck className="w-3.5 h-3.5 text-violet-400" />
                  Submitted for Evaluation {activeObservation.aiRecommendedMarks ? `(AI: ${activeObservation.aiRecommendedMarks}/10)` : ''}
                </span>
              ) : isExecutionSuccessful ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Execution Successful (Exit 0)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Coding in Progress
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTaskInstructions(!showTaskInstructions)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span>{showTaskInstructions ? 'Hide Manual' : 'Problem Statement'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTaskInstructions ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmittingObservation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Save draft of your code & observation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingObservation ? 'animate-spin text-violet-400' : 'text-zinc-400'}`} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleOpenObservationModal}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-all cursor-pointer"
                title={!isExecutionSuccessful && !activeObservation ? "Execute code successfully first" : "Open Digital Observation Form"}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>
                  {activeObservation?.status === 'APPROVED' ? 'View Approved Observation ➔' : 
                   activeObservation?.status === 'CORRECTION_REQUIRED' ? 'Resubmit Observation ➔' :
                   activeObservation ? 'Review Observation ➔' : 'Digital Observation Form ➔'}
                </span>
              </button>
            </div>
          </div>

          {/* Task Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-violet-400" />
                {activeTask.title}
              </h2>
              <span className="text-zinc-600">•</span>
              <span className="text-violet-300 font-semibold">
                {activeTask.subject?.name} ({activeTask.subject?.code})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-zinc-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-violet-400" />
                Faculty: <strong className="text-zinc-200">{activeTask.faculty?.fullName}</strong>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3 text-indigo-400" />
                Section: <strong className="text-zinc-200">{activeTask.section?.name}</strong>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Deadline: <strong className="text-zinc-200">{new Date(activeTask.closeTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</strong>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                Evaluation Scale: <strong className="text-emerald-300">10 Marks</strong>
              </span>
            </div>
          </div>

          {/* Expandable Instructions Panel */}
          {showTaskInstructions && (
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="font-bold text-violet-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span>Experiment Instructions & Problem Specification:</span>
              </div>
              <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
                {activeTask.instructions || activeTask.description || 'Implement the algorithm, test boundary conditions, and verify your output using the compiler.'}
              </p>
              {activeTask.aim && (
                <div className="pt-2 border-t border-zinc-900 text-zinc-400">
                  <strong className="text-zinc-300">Faculty Aim:</strong> {activeTask.aim}
                </div>
              )}
            </div>
          )}
        </div>
      ) : availableTasks.length > 0 ? (
        <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#121320] to-[#0d0f17] border border-zinc-800/80 flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center gap-2 text-zinc-300">
            <ListTodo className="w-4 h-4 text-violet-400" />
            <span>You have <strong>{availableTasks.length}</strong> assigned lab experiments for your section.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">Select Experiment:</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) setActiveTaskId(e.target.value);
              }}
              className="bg-zinc-950 text-violet-300 border border-zinc-800 rounded-xl px-3 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">Choose Lab Task...</option>
              {availableTasks.map(t => (
                <option key={t.id} value={t.id}>
                  Exp {t.experimentNumber}: {t.title} ({t.subject})
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {/* SMART DIGITAL LAB OBSERVATION MODAL */}
      {isObservationModalOpen && activeTask && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[92vh] bg-[#0F1018] border border-violet-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Official Academic Header */}
            <div className="p-5 border-b border-zinc-800/90 bg-[#141624] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-extrabold block">
                  🏛️ Bonam Venkatachalam Engineering College (Autonomous) • Department of CSE
                </span>
                <h3 className="font-extrabold text-base text-white mt-0.5 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-violet-400" />
                  Digital Laboratory Observation & Automated Assessment Record
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Assigned Faculty: <strong className="text-violet-300">{activeTask.faculty?.fullName}</strong> ({activeTask.faculty?.email})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewObservationMode(!previewObservationMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    previewObservationMode 
                      ? 'bg-violet-600 text-white border-violet-500' 
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                  }`}
                >
                  {previewObservationMode ? '✏️ Edit Form' : '👁️ Printable Preview'}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                  title="Print / Download PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsObservationModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitObservation} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Faculty Correction Required Alert */}
              {activeObservation?.status === 'CORRECTION_REQUIRED' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Correction Requested by Faculty: {activeTask.faculty?.fullName}</span>
                  </div>
                  <p className="text-xs text-amber-100/90 pl-6">
                    <strong>Faculty Remarks:</strong> &quot;{activeObservation.facultyRemarks || activeObservation.feedback || 'Please update your algorithm and verify output before resubmission.'}&quot;
                  </p>
                  <p className="text-[11px] text-amber-300/80 pl-6 italic">
                    You can edit the fields below and click &quot;Resubmit to Faculty&quot;.
                  </p>
                </div>
              )}

              {/* Faculty Approved Banner */}
              {(activeObservation?.status === 'APPROVED' || activeObservation?.status === 'EVALUATED') && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Approved & Evaluated by Faculty: {activeTask.faculty?.fullName}
                    </span>
                    <span className="text-base font-mono font-black text-emerald-300">
                      Final Marks: {activeObservation.facultyFinalMarks ?? activeObservation.marksAwarded} / 10 Marks
                    </span>
                  </div>
                  {activeObservation.facultyRemarks && (
                    <p className="text-xs text-emerald-200 italic pt-1">
                      Faculty Remarks: &quot;{activeObservation.facultyRemarks}&quot;
                    </p>
                  )}
                </div>
              )}

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Student Name</span>
                  <span className="text-white font-bold">{studentProfile.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Roll Number</span>
                  <span className="text-violet-300 font-bold">{studentProfile.rollNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Section</span>
                  <span className="text-indigo-300 font-bold">{activeTask.section?.name || 'CSE-A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Programming Language</span>
                  <span className="text-emerald-400 font-bold uppercase">{executedSnapshot.language || activeFile?.language || activeTask.language}</span>
                </div>
              </div>

              {/* 1. Experiment Number & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Exp Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`Exp ${activeTask.experimentNumber}`}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-violet-300 font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Experiment Title / Name
                  </label>
                  <input
                    type="text"
                    value={observationForm.experimentName || activeTask.title}
                    onChange={(e) => setObservationForm({ ...observationForm, experimentName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* 2. Aim Field */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Aim of the Experiment (Enter manually) *</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Student Manual Input</span>
                </label>
                <textarea
                  rows={2}
                  value={observationForm.aim}
                  onChange={(e) => setObservationForm({ ...observationForm, aim: e.target.value })}
                  required
                  placeholder="State the objective of this laboratory experiment..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans"
                />
              </div>

              {/* 3. Algorithm Field */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Algorithm / Step-by-Step Logic (Enter manually) *</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Student Manual Input</span>
                </label>
                <textarea
                  rows={4}
                  value={observationForm.algorithm}
                  onChange={(e) => setObservationForm({ ...observationForm, algorithm: e.target.value })}
                  required
                  placeholder="Step 1: Start&#10;Step 2: Read input values&#10;Step 3: Implement core logic&#10;Step 4: Display the result&#10;Step 5: Stop"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-mono leading-relaxed"
                />
              </div>

              {/* 4. Program Source Code (Auto-populated with Execution Snapshot) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Program Source Code (Auto-fetched from Code Space) *
                    </label>
                    {isCodeModified && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                        ⚠️ Manually Edited (Original snapshot kept)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {executedSnapshot.code && isCodeModified && (
                      <button
                        type="button"
                        onClick={() => setObservationForm({ ...observationForm, programCode: executedSnapshot.code })}
                        className="text-[10px] text-violet-300 hover:text-white underline cursor-pointer"
                      >
                        Reset to Executed Code
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-zinc-500">
                      {(observationForm.programCode || activeFile?.code || '').split('\n').length} lines
                    </span>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={observationForm.programCode || activeFile?.code || ''}
                  onChange={(e) => setObservationForm({ ...observationForm, programCode: e.target.value })}
                  placeholder="// Paste or write source code here..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-emerald-400 font-mono leading-relaxed focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* 5. Program Output (Auto-populated from Verified Compiler Output) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Program Output (Auto-fetched from Compiler Execution) *
                    </label>
                    {isOutputModified && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                        ⚠️ Manually Edited (Original snapshot kept)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      Verified Exit Code: 0
                    </span>
                    {executedSnapshot.output && isOutputModified && (
                      <button
                        type="button"
                        onClick={() => setObservationForm({ ...observationForm, executionOutput: executedSnapshot.output })}
                        className="text-[10px] text-violet-300 hover:text-white underline cursor-pointer"
                      >
                        Reset Output
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={observationForm.executionOutput || output || ''}
                  onChange={(e) => setObservationForm({ ...observationForm, executionOutput: e.target.value })}
                  placeholder="Compiler output will appear here automatically after execution..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* 6. Result Field */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Result & Conclusion (Enter manually) *</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Student Manual Input</span>
                </label>
                <textarea
                  rows={2}
                  value={observationForm.result}
                  onChange={(e) => setObservationForm({ ...observationForm, result: e.target.value })}
                  required
                  placeholder="State the final outcome and verification conclusion..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 font-sans"
                />
              </div>

              {/* 7. Student Remarks Field */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Student Remarks / Notes (Optional)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Student Remarks</span>
                </label>
                <input
                  type="text"
                  value={observationForm.studentRemarks}
                  onChange={(e) => setObservationForm({ ...observationForm, studentRemarks: e.target.value })}
                  placeholder="e.g. Executed successfully with optimal time complexity."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* 8. AUTOMATED AI EVALUATION REPORT (10 MARKS BREAKDOWN) */}
              {parsedAiReport && (
                <div className="p-4 rounded-2xl bg-[#141522] border border-violet-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      Automated AI Evaluation Report (Provisional: 10 Marks Scale)
                    </span>
                    <span className="font-mono font-black text-sm text-violet-300 bg-violet-500/20 px-2.5 py-0.5 rounded-full border border-violet-500/30">
                      Score: {parsedAiReport.totalMarks} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-500 block truncate">1. Correctness</span>
                      <strong className="text-white font-mono text-sm">{parsedAiReport.breakdown?.programCorrectness?.score ?? 0} / 3</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-500 block truncate">2. Output & Tests</span>
                      <strong className="text-white font-mono text-sm">{parsedAiReport.breakdown?.outputAccuracy?.score ?? 0} / 3</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-500 block truncate">3. Algorithm</span>
                      <strong className="text-white font-mono text-sm">{parsedAiReport.breakdown?.algorithmCorrectness?.score ?? 0} / 2</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-500 block truncate">4. Completeness</span>
                      <strong className="text-white font-mono text-sm">{parsedAiReport.breakdown?.observationCompleteness?.score ?? 0} / 1</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-500 block truncate">5. Code Quality</span>
                      <strong className="text-white font-mono text-sm">{parsedAiReport.breakdown?.codeQuality?.score ?? 0} / 1</strong>
                    </div>
                  </div>

                  {parsedAiReport.identifiedMistakes && parsedAiReport.identifiedMistakes.length > 0 && (
                    <div className="text-xs text-rose-300 space-y-1 pt-1">
                      <strong className="text-[11px] uppercase tracking-wider block text-rose-400">Identified Observations:</strong>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {parsedAiReport.identifiedMistakes.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400 italic">
                    ℹ️ AI evaluation marks are provisional recommendations. Final academic marks are awarded by faculty <strong>{activeTask.faculty?.fullName}</strong>.
                  </p>
                </div>
              )}

              {/* Submission Destination Confirmation */}
              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-xs text-violet-300 flex items-center gap-2.5">
                <Send className="w-4 h-4 flex-shrink-0 text-violet-400" />
                <span>
                  This digital observation will be delivered directly to your assigned faculty <strong>{activeTask.faculty?.fullName}</strong> ({activeTask.faculty?.email}) for review and final marks entry.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmittingObservation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Save draft without submitting to faculty"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingObservation ? 'animate-spin' : ''}`} />
                  <span>Save Draft</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsObservationModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingObservation || (!observationForm.programCode && !activeFile?.code)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
                  >
                    {isSubmittingObservation ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating & Submitting...</span>
                      </>
                    ) : activeObservation?.status === 'CORRECTION_REQUIRED' ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Resubmit Corrected Observation ➔</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm & Submit for Evaluation ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN PRO IDE CONTAINER */}
      <div className={`flex flex-col border border-white/[0.08] overflow-hidden bg-[#07080C] shadow-[0_12px_60px_rgba(0,0,0,0.85)] font-sans text-sm rounded-2xl ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none h-screen w-screen' : 'relative h-[calc(100vh-130px)] min-h-[600px]'}`}>
        
        {/* PRO COMMAND CENTER / TOP NAVIGATION BAR */}
        <div className="h-12 border-b border-white/[0.08] bg-[#0A0C13]/90 backdrop-blur-md flex items-center justify-between px-3 gap-2 shrink-0 z-20 select-none">
          
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsExplorerOpen(!isExplorerOpen)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isExplorerOpen 
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' 
                  : 'bg-zinc-900/80 text-zinc-400 border-white/[0.06] hover:text-white hover:bg-zinc-800'
              }`}
              title={isExplorerOpen ? "Hide File Explorer" : "Show File Explorer"}
            >
              <Folder className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-tight text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="hidden sm:inline bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  BVCEC Pro IDE
                </span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden md:inline flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Cluster Online • 12ms</span>
              </span>
            </div>
          </div>

          {/* Center / Right: Multi-Server Selection, Language Dropdown, Run Button & Tools */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            
            {/* Multi-Server Selection Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/90 border border-white/[0.08] rounded-xl text-xs shrink-0 shadow-sm hover:border-zinc-700 transition-colors">
              <Server className={`w-3.5 h-3.5 ${activeServerConfig.iconColor} shrink-0`} />
              <select
                value={compilerEngine}
                onChange={(e) => setCompilerEngine(e.target.value)}
                className="bg-transparent text-xs text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-1"
                title="Select Compiler Server"
              >
                {compilerServers.map((srv, idx) => (
                  <option key={srv.id} value={srv.id} className="bg-[#10121a] text-zinc-200">
                    {idx + 1}. {srv.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Failover Backup Pill Toggle */}
            <button
              type="button"
              onClick={() => setAutoFallback(!autoFallback)}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                autoFallback 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
              title="When enabled, if the primary server fails or is rate-limited, the system automatically falls back to secondary servers."
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${autoFallback ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>Backup: {autoFallback ? 'ON' : 'OFF'}</span>
            </button>

            {/* Language Selection Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/90 border border-white/[0.08] rounded-xl text-xs shrink-0 shadow-sm hover:border-zinc-700 transition-colors">
              <span className={`w-2 h-2 rounded-full ${activeLangConfig.dot} shadow-[0_0_8px_currentColor]`} />
              <select 
                value={activeFile ? activeFile.language : "python"}
                onChange={handleLanguageDropdownChange}
                disabled={!activeFile}
                className="text-xs bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer pr-1 disabled:opacity-50"
                title="Select Programming Language"
              >
                {(dynamicLanguages.length > 0 ? dynamicLanguages : Object.keys(dynamicLangNames).map(id => ({ id, name: dynamicLangNames[id] }))).map(lang => (
                  <option key={lang.id} value={lang.id} className="bg-[#10121a] text-zinc-200">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave}
              disabled={!activeFile}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              title="Save (Ctrl+S)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin text-violet-400' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>

            {/* AI Tutor Assistant Trigger */}
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/35 hover:to-indigo-600/35 text-violet-300 hover:text-white border border-violet-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0"
              title="Open AI Socratic Tutor Drawer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Tutor</span>
            </button>

            {/* DIGITAL OBSERVATION QUICK ACTION (WHEN TASK IS ACTIVE) */}
            {activeTask && (
              <button
                onClick={handleOpenObservationModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isExecutionSuccessful
                    ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 hover:from-violet-600/40 hover:to-indigo-600/40 text-violet-200 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
                }`}
                title="Open Digital Lab Observation Document"
              >
                <FileCheck className={`w-3.5 h-3.5 ${isExecutionSuccessful ? 'text-violet-300' : 'text-zinc-500'}`} />
                <span className="hidden sm:inline">Observation</span>
                {isExecutionSuccessful && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                )}
              </button>
            )}

            {/* STANDOUT PRO RUN BUTTON */}
            <button 
              onClick={handleRunCode}
              disabled={isRunning || !activeFile}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:via-teal-300 hover:to-emerald-400 disabled:opacity-50 text-black rounded-xl text-xs font-black transition-all shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)] active:scale-95 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Run Code (Ctrl + Enter)"
            >
              <Play className={`w-3.5 h-3.5 fill-black ${isRunning ? 'animate-pulse' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
              <kbd className="hidden sm:inline text-[9px] bg-black/20 border border-black/30 px-1 py-0.5 rounded font-mono font-bold text-black/80">
                Ctrl+↵
              </kbd>
            </button>
          </div>
        </div>

        {/* WORKSPACE MIDDLE BODY: EXPLORER + EDITOR + TERMINAL */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* SIDEBAR EXPLORER */}
          {isExplorerOpen && (
            <div className="w-48 lg:w-56 bg-[#0c0d14] border-r border-zinc-800/80 flex flex-col shrink-0 animate-in slide-in-from-left duration-200">
              <div className="h-9 flex items-center justify-between px-3 border-b border-zinc-800/80 bg-[#0f111a]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Folder className="w-3 h-3 text-violet-400" />
                  Files
                </span>
                <div className="flex gap-1 text-zinc-400">
                  <button onClick={handleCreateFile} className="p-1 hover:text-white hover:bg-zinc-800/80 transition-colors rounded" title="New File">
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleCreateFolder} className="p-1 hover:text-white hover:bg-zinc-800/80 transition-colors rounded" title="New Folder">
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => window.location.reload()} className="p-1 hover:text-white hover:bg-zinc-800/80 transition-colors rounded" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-2 border-b border-zinc-800/80 bg-[#0c0d14]">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter files..." 
                    className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg bg-zinc-950 text-white border border-zinc-800 focus:outline-none focus:border-violet-500 placeholder-zinc-500 font-sans"
                  />
                </div>
              </div>

              {/* Tree list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {renderTree(fileSystem)}
              </div>
            </div>
          )}

          {/* MAIN EDITOR COLUMN */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#090A0F]">
            
            {/* VS CODE STYLE TABS BAR */}
            <div className="h-9 border-b border-zinc-800/80 bg-[#0B0C12] flex items-center justify-between px-2 gap-2 shrink-0 z-10 overflow-x-auto no-scrollbar">
              
              {/* File Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {openFilesList.map((f) => {
                  const isActive = f.id === activeFileId;
                  const langColor = LANGUAGE_COLORS[f.language] || LANGUAGE_COLORS.python;

                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setActiveFileId(f.id);
                        setSelectedFolderId(null);
                      }}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-all border-b-2 ${
                        isActive
                          ? 'bg-[#12131D] text-white border-violet-500 font-semibold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${langColor.dot}`} />
                      <span className="truncate max-w-[130px]">{f.name}</span>
                    </div>
                  );
                })}

                <button
                  onClick={handleCreateFile}
                  className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 rounded-md transition-colors"
                  title="New File"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editor Right Mini-Actions */}
              <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
                
                {/* Font Size Zoom */}
                <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-lg px-1 py-0.5 text-[10px]">
                  <button
                    onClick={() => setEditorFontSize(prev => Math.max(11, prev - 1))}
                    className="p-1 hover:text-white transition-colors"
                    title="Zoom Out Font"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-zinc-300 px-1">{editorFontSize}px</span>
                  <button
                    onClick={() => setEditorFontSize(prev => Math.min(18, prev + 1))}
                    className="p-1 hover:text-white transition-colors"
                    title="Zoom In Font"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>

                {/* Format Code */}
                <button
                  onClick={handleFormatCode}
                  className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Format Document (Prettier alignment)"
                >
                  <Braces className="w-3.5 h-3.5" />
                </button>

                {/* Reset Code */}
                <button
                  onClick={handleResetCode}
                  className="p-1.5 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Copy Code */}
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Copy Code to Clipboard"
                >
                  {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* AI Code Pad Smart Action Ribbon */}
            <div className="bg-[#0B0C12]/95 border-b border-zinc-800/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 select-none">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 shrink-0 mr-1">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  <span>AI Copilot:</span>
                </span>

                <button
                  onClick={() => handleAiCodePadAction("fix_code")}
                  disabled={isAiActionLoading || !activeFile}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 shrink-0"
                  title="Analyze errors and apply fixed code to editor"
                >
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <span>Auto-Fix Code</span>
                </button>

                <button
                  onClick={() => handleAiCodePadAction("optimize_code")}
                  disabled={isAiActionLoading || !activeFile}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 shrink-0"
                  title="Refactor for optimal Time and Space complexity (Big-O)"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Optimize</span>
                </button>

                <button
                  onClick={() => handleAiCodePadAction("add_comments")}
                  disabled={isAiActionLoading || !activeFile}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 shrink-0"
                  title="Inject step-by-step educational comments into your code"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>Add Comments</span>
                </button>
              </div>

              {/* Status / Notification Pill */}
              {aiNotification && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/35 text-[11px] font-medium animate-in fade-in slide-in-from-top-1 duration-200 shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{aiNotification}</span>
                </div>
              )}
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 bg-[#090A0F] relative">
              {activeFile ? (
                <Editor
                  height="100%"
                  language={activeFile.language}
                  theme="vs-dark"
                  value={activeFile.code}
                  onChange={handleEditorChange}
                  onMount={(editor) => {
                    editorRef.current = editor;
                    editor.onDidChangeCursorPosition((e) => {
                      setCursorPos({ ln: e.position.lineNumber, col: e.position.column });
                    });
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: editorFontSize,
                    padding: { top: 12, bottom: 12 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontLigatures: true,
                    scrollBeyondLastLine: false,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    bracketPairColorization: { enabled: true },
                    automaticLayout: true,
                    wordWrap: isWordWrap ? "on" : "off",
                    formatOnPaste: true,
                    tabSize: 4
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center flex-col gap-4 text-zinc-600">
                  <FileCode2 className="w-16 h-16 opacity-20" />
                  <p>Select a file from the Explorer or click &quot;+&quot; to create a new file</p>
                </div>
              )}
            </div>

            {/* PRO BOTTOM STATUS BAR */}
            <div className="h-6 flex items-center px-3 text-[10px] gap-3 shrink-0 bg-[#0B0C12] border-t border-zinc-800/80 text-zinc-400 select-none">
              <span className="font-semibold text-zinc-200 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${activeLangConfig.dot}`} />
                {activeFile ? `${LANGUAGE_DISPLAY_NAME[activeFile.language] || activeFile.language} v${LANGUAGE_VERSIONS[activeFile.language] || ''}` : "No file"}
              </span>
              <span className="text-zinc-700">|</span>
              <span>UTF-8</span>
              <span className="text-zinc-700">|</span>
              <span>Spaces: 4</span>
              <span className="text-zinc-700">|</span>
              <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
              {executionTime && (
                <>
                  <span className="text-zinc-700">|</span>
                  <span className="text-violet-400 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {executionTime}
                  </span>
                </>
              )}
              <span className="text-zinc-700">|</span>
              <button 
                onClick={() => setIsAiDrawerOpen(true)}
                className="text-zinc-400 hover:text-violet-300 transition-colors cursor-pointer flex items-center gap-1"
                title="Click to view AI analysis report"
              >
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span>Code Score: <strong className={codeAnalysis.passPercentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{codeAnalysis.passPercentage}%</strong></span>
              </button>
              <div className="flex-1" />
              {isRunning ? (
                <span className="text-amber-400 flex items-center gap-1.5 animate-pulse font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Executing...
                </span>
              ) : isExecutionSuccessful ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Exit Code: 0 (Success)
                </span>
              ) : (
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Ready
                </span>
              )}
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-400 flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-violet-400" />
                <span>Engine: {lastEngineUsed}</span>
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: PRO MULTI-TAB TERMINAL & DIAGNOSTICS CONSOLE */}
          <div className="w-full md:w-80 lg:w-96 xl:w-[460px] bg-[#0c0d14] border-t md:border-t-0 md:border-l border-zinc-800/90 flex flex-col shrink-0">
            
            {/* Terminal Tab Navigation */}
            <div className="h-10 bg-[#0A0C13] border-b border-white/[0.08] px-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                
                {/* macOS Style Window Dots for Unix Terminal Aesthetic */}
                <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-white/[0.08]">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                </div>
                
                {/* Output Tab */}
                <button
                  onClick={() => setRightPanelTab("output")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    rightPanelTab === "output"
                      ? "bg-violet-600/25 text-violet-300 border border-violet-500/35 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                {/* Stdin Tab */}
                <button
                  onClick={() => setRightPanelTab("stdin")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    rightPanelTab === "stdin"
                      ? "bg-violet-600/25 text-violet-300 border border-violet-500/35 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Input (stdin)</span>
                  {stdin && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>

                {/* Diagnostics Tab */}
                <button
                  onClick={() => setRightPanelTab("diagnostics")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    rightPanelTab === "diagnostics"
                      ? "bg-violet-600/25 text-violet-300 border border-violet-500/35 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Diagnostics</span>
                </button>

                {/* AI Professor Tab */}
                <button
                  onClick={() => setRightPanelTab("ai")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    rightPanelTab === "ai"
                      ? "bg-violet-600/25 text-violet-300 border border-violet-500/35 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                  <span>AI Mentor</span>
                </button>
              </div>

              <button
                onClick={() => setIsAiDrawerOpen(true)}
                className="p-1.5 text-zinc-400 hover:text-violet-300 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Expand AI Tutor Drawer"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB CONTENT 1: OUTPUT CONSOLE */}
            {rightPanelTab === "output" && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#090A0F]">
                {/* Console Metadata Toolbar */}
                <div className="h-9 flex items-center justify-between px-3 bg-[#0B0C12] border-b border-zinc-800/80 shrink-0 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-violet-400" />
                      Console Output
                    </span>

                    {/* Exit Code Badge */}
                    {exitCode !== null && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                        exitCode === 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${exitCode === 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {exitCode === 0 ? 'Exit 0: Success' : `Exit ${exitCode}: Error`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Execution Latency Badge */}
                    {executionTime && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30">
                        <Clock className="w-2.5 h-2.5 text-violet-400" />
                        {executionTime}
                      </span>
                    )}

                    {/* Ask AI Doctor Button on Error */}
                    {output && (output.includes("❌") || output.includes("Error") || output.includes("STDERR") || output.includes("Exception")) && (
                      <button
                        onClick={() => {
                          setRightPanelTab("ai");
                          handleAskAiSidebar("Please analyze this compiler error and guide me on how to fix it without spoiling the solution.");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-colors cursor-pointer"
                        title="Ask AI Professor to diagnose error"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                        <span>Diagnose</span>
                      </button>
                    )}

                    {/* Open Observation Form shortcut when execution succeeds */}
                    {isExecutionSuccessful && activeTask && (
                      <button
                        onClick={handleOpenObservationModal}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                        title="Open Digital Observation Form"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        <span>Observation Form</span>
                      </button>
                    )}

                    {/* Copy Output Button */}
                    {output && (
                      <button
                        onClick={handleCopyOutput}
                        className="p-1 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded transition-colors"
                        title="Copy Console Output"
                      >
                        {isCopiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Clear Output Button */}
                    {output && (
                      <button
                        onClick={() => {
                          setOutput("");
                          setExecutionTime(null);
                          setExitCode(null);
                          setIsExecutionSuccessful(false);
                        }}
                        className="p-1 hover:text-rose-400 text-zinc-400 hover:bg-zinc-800 rounded transition-colors"
                        title="Clear console"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Console Output Screen */}
                <div className="flex-1 p-3.5 font-mono text-xs overflow-y-auto bg-[#090A0F]" style={{ scrollbarWidth: "thin" }}>
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                        <Play className="w-4 h-4 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-violet-400" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-200 animate-pulse">Compiling & executing code...</p>
                      <span className="text-[10px] font-mono text-zinc-500">Connected to {lastEngineUsed}</span>
                    </div>
                  ) : output ? (
                    <div>
                      {/* Interactive Execution Verification Callout for Digital Observation */}
                      {isExecutionSuccessful && activeTask && (
                        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0B1510] to-emerald-950/40 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                                <span>Execution Verified (Exit Code 0)</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate">
                                Code & output synced. Ready to submit lab observation.
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleOpenObservationModal}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.45)] transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-black" />
                            <span>Open Observation Form ➔</span>
                          </button>
                        </div>
                      )}

                      <pre
                        className="font-mono text-xs whitespace-pre-wrap break-words leading-relaxed select-text"
                        style={{
                          color: output.includes("❌") || output.includes("⚠️ STDERR") || output.includes("[Error]") || output.includes("Exception")
                            ? "#f87171"
                            : isExecutionSuccessful
                            ? "#4ade80"
                            : "#e4e4e7"
                        }}
                      >
                        {output}
                      </pre>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleRunCode()}
                      className="flex flex-col items-center justify-center h-full gap-2 opacity-60 hover:opacity-100 transition-all cursor-pointer group select-none"
                      title="Click to Run Code"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-violet-500/50 shadow-inner group-hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all">
                        <Play className="w-6 h-6 text-violet-500 fill-violet-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-zinc-300 group-hover:text-white font-bold text-xs transition-colors">Terminal Idle</p>
                      <p className="text-[10px] text-zinc-500">
                        Click &quot;Run&quot; or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">Ctrl+Enter</kbd>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: STANDARD INPUT (STDIN) */}
            {rightPanelTab === "stdin" && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#090A0F]">
                <div className="p-3 border-b border-zinc-800 bg-[#0B0C12] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Standard Input (stdin)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {stdin ? `${stdin.split('\n').length} lines • ${stdin.length} chars` : 'Empty (No input)'}
                    </span>
                  </div>

                  {/* Preset Input Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[10px] text-zinc-500 shrink-0">Presets:</span>
                    {STDIN_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setStdin(p.value)}
                        className="shrink-0 px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] font-mono transition-colors cursor-pointer"
                        title={p.value}
                      >
                        {p.label}
                      </button>
                    ))}
                    {stdin && (
                      <button
                        onClick={() => setStdin("")}
                        className="shrink-0 px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea 
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs here that will be passed to your program via standard input (e.g. input(), cin, Scanner)..." 
                  className="flex-1 p-3.5 font-mono text-xs bg-[#090A0F] text-white resize-none focus:outline-none placeholder-zinc-600 leading-relaxed"
                  spellCheck="false"
                />
              </div>
            )}

            {/* TAB CONTENT 3: EXECUTION DIAGNOSTICS & SERVER HEALTH */}
            {rightPanelTab === "diagnostics" && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#090A0F] text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
                    Execution Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Execution Latency</span>
                      <span className="font-bold text-white">{executionTime || 'Pending Run'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Memory Allocated</span>
                      <span className="font-bold text-white">{engineMemory || '14.2 MB'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Exit Code</span>
                      <span className={`font-bold ${exitCode === 0 ? 'text-emerald-400' : exitCode !== null ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {exitCode !== null ? exitCode : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Engine In Use</span>
                      <span className="font-bold text-violet-300">{lastEngineUsed}</span>
                    </div>
                  </div>
                </div>

                {/* Server Matrix Health */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Supported Compiler Servers Status
                  </span>
                  <div className="space-y-1.5">
                    {compilerServers.map((srv) => {
                      const isSelected = compilerEngine === srv.id;
                      return (
                        <div 
                          key={srv.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'bg-violet-600/15 border-violet-500/40 text-white' 
                              : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-bold text-xs text-zinc-200">{srv.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {srv.badge}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {srv.ping}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: EMBEDDED AI SOCRATIC PROFESSOR */}
            {rightPanelTab === "ai" && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#090A0F]">
                {/* AI Header & Metrics */}
                <div className="p-3 bg-[#0B0C12] border-b border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-extrabold flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-violet-400" />
                      AI Socratic Mentor
                    </span>
                    <span className={`font-mono text-xs font-bold ${
                      codeAnalysis.passPercentage >= 80 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      Quality: {codeAnalysis.passPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                    <span>Complexity: <strong className="text-zinc-200">{codeAnalysis.metrics.estimatedTimeComplexity}</strong></span>
                    <span>•</span>
                    <span>Space: <strong className="text-zinc-200">{codeAnalysis.metrics.estimatedSpaceComplexity}</strong></span>
                  </div>
                </div>

                {/* Quick AI Action Chips */}
                <div className="px-2.5 py-2 border-b border-zinc-800 bg-[#0c0d14] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => handleAskAiSidebar("Give me a Socratic hint on how to improve this code")}
                    disabled={isAiSidebarLoading}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-violet-300 border border-violet-500/20 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>Socratic Hint</span>
                  </button>

                  <button
                    onClick={() => handleAskAiSidebar("Analyze my code line-by-line and identify any subtle bugs")}
                    disabled={isAiSidebarLoading}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Audit Bugs</span>
                  </button>

                  <button
                    onClick={() => handleAskAiSidebar("Explain the Big-O Time and Space Complexity")}
                    disabled={isAiSidebarLoading}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Big-O</span>
                  </button>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs">
                  {aiSidebarMessages.map((msg, idx) => {
                    const isUser = msg.sender === "user";
                    const codeToInject = msg.generatedCode || extractCodeSnippet(msg.text);

                    return (
                      <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[92%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                          isUser 
                            ? "bg-violet-600 text-white rounded-tr-none shadow-sm font-medium" 
                            : "bg-zinc-950 border border-zinc-800/90 text-zinc-200 rounded-tl-none shadow-sm"
                        }`}>
                          {!isUser && (
                            <div className="text-[10px] font-bold text-violet-400 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" /> Professor
                              </span>
                              {codeToInject && (
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  Code Ready
                                </span>
                              )}
                            </div>
                          )}
                          <div>{msg.text}</div>

                          {/* 1-Click Code Injection to Editor */}
                          {!isUser && codeToInject && (
                            <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                Write to Code Pad:
                              </span>
                              <button
                                onClick={() => applyCodeToEditor(codeToInject, "✨ Applied Professor's code to Code Pad!")}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                                title="Write this code directly into your editor"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Apply to Editor</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isAiSidebarLoading && (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl rounded-tl-none text-xs text-zinc-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                      <span>Professor is thinking and reviewing your code...</span>
                    </div>
                  )}
                </div>

                {/* Sidebar Input Bar */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAiSidebar();
                  }}
                  className="p-2.5 border-t border-zinc-800/80 bg-[#0B0C12] flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={aiSidebarInput}
                    onChange={(e) => setAiSidebarInput(e.target.value)}
                    placeholder="Ask professor a question about your code..."
                    disabled={isAiSidebarLoading}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={!aiSidebarInput.trim() || isAiSidebarLoading}
                    className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Socratic Teaching Assistant Drawer */}
      <AIChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        code={activeFile ? activeFile.code : ""}
        language={activeFile ? LANGUAGE_DISPLAY_NAME[activeFile.language] || activeFile.language : "Python"}
        problem={{
          title: activeFile ? activeFile.name : "Codespace Project",
          description: `Codespace workspace editing ${activeFile?.name || 'main'} in ${activeFile?.language || 'Python'}.`
        }}
        errorLogs={output && (output.includes("❌") || output.includes("Error") || output.includes("STDERR")) ? output : ""}
        onApplyCode={applyCodeToEditor}
      />
    </div>
  );
}

export default function CodespacePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-violet-400" />
        Loading Codespace Environment...
      </div>
    }>
      <CodespaceContent />
    </Suspense>
  );
}
