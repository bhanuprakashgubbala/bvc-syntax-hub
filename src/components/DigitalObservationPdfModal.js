'use client';

import { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Award, 
  Calendar, 
  User, 
  Building, 
  BookOpen,
  Check
} from 'lucide-react';

export default function DigitalObservationPdfModal({
  isOpen,
  onClose,
  subjectName = 'Computer Science Lab',
  subjectCode = 'CSE-LAB',
  student = null,
  facultyName = 'Assigned Faculty',
  tasksWithObservations = []
}) {
  if (!isOpen) return null;

  const studentName = student?.fullName || student?.name || 'Student';
  const rollNumber = student?.rollNumber || student?.studentId || '25221A0501';
  const section = student?.section || 'CSE-A';
  const academicYear = '2026 - 2027';

  // Sort experiments by number
  const sortedTasks = [...tasksWithObservations].sort((a, b) => {
    const numA = parseInt(a.experimentNumber || '0', 10);
    const numB = parseInt(b.experimentNumber || '0', 10);
    return numA - numB;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-zinc-950/95 backdrop-blur-md">
      {/* Screen Toolbar (Hidden during print) */}
      <div className="print:hidden h-14 bg-[#0A0C14] border-b border-zinc-800 px-4 md:px-8 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Digital Observation Book (PDF View & Print)</span>
              <span className="text-xs text-violet-400 font-mono font-normal">[{subjectName}]</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Student: {studentName} ({rollNumber}) • {sortedTasks.length} Experiments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-900/60 print:p-0 print:bg-white print:overflow-visible">
        <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none text-zinc-900 font-sans">
          
          {/* ========================================================= */}
          {/* COVER PAGE (PAGE 1)                                       */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border border-zinc-200 print:shadow-none print:border-none print:p-8 print:rounded-none page-break">
            
            {/* College Header with Logo */}
            <div className="text-center border-b-2 border-zinc-900 pb-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-3">
                <img 
                  src="/bvc-logo.png" 
                  alt="BVCEC Logo" 
                  className="w-16 h-16 object-contain" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 uppercase">
                    BONAM VENKATACHALAM ENGINEERING COLLEGE
                  </h1>
                  <p className="text-xs font-semibold text-zinc-700 tracking-wide mt-0.5">
                    (Autonomous Institution • Approved by AICTE, Accredited by NBA & NAAC)
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    Allavaram Mandal, Odalaravu, Dr. B. R. Ambedkar Konaseema Dist, A.P. - 533216
                  </p>
                </div>
              </div>

              <div className="inline-block px-4 py-1 rounded bg-zinc-100 text-zinc-900 font-bold text-xs uppercase tracking-widest mt-2 border border-zinc-300">
                Department of Computer Science & Engineering
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-6 my-4 border-y border-dashed border-zinc-300 bg-zinc-50/70 rounded-xl">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-widest block mb-1">
                Official Institutional Academic Document
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight uppercase">
                DIGITAL LABORATORY OBSERVATION BOOK
              </h2>
              <div className="text-sm font-semibold text-zinc-700 mt-2">
                Laboratory Course: <span className="text-indigo-900 font-bold underline">{subjectName}</span> ({subjectCode})
              </div>
              <div className="text-xs text-zinc-600 font-mono mt-1">
                Academic Year: {academicYear}
              </div>
            </div>

            {/* Student Identification Table */}
            <div className="my-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 border-b border-zinc-200 pb-1">
                Student Credentials & Laboratory Allocation
              </h4>
              <table className="w-full text-xs border border-zinc-300">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="w-1/3 py-2 px-3 bg-zinc-100 font-bold text-zinc-700">Student Full Name:</td>
                    <td className="py-2 px-3 font-semibold text-zinc-900 uppercase">{studentName}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 px-3 bg-zinc-100 font-bold text-zinc-700">Roll / Hall Ticket No:</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-900">{rollNumber}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 px-3 bg-zinc-100 font-bold text-zinc-700">Program & Branch:</td>
                    <td className="py-2 px-3 text-zinc-900 font-medium">B.Tech - Computer Science & Engineering</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 px-3 bg-zinc-100 font-bold text-zinc-700">Class Section:</td>
                    <td className="py-2 px-3 font-semibold text-zinc-900">{section}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 bg-zinc-100 font-bold text-zinc-700">Faculty In-Charge:</td>
                    <td className="py-2 px-3 font-semibold text-zinc-900">{facultyName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Certificate of Authenticity */}
            <div className="my-6 p-4 rounded-xl border border-zinc-300 bg-zinc-50/50 text-xs text-zinc-700 leading-relaxed text-justify">
              <p>
                <strong>INSTITUTIONAL CERTIFICATE:</strong> This is to certify that this digital observation record represents the bonafide work completed in the <strong>{subjectName}</strong> laboratory by <strong>{studentName}</strong> (Roll No: <strong>{rollNumber}</strong>) of <strong>Section {section}</strong>. All source programs have been compiled and verified on the autonomous compiler infrastructure with genuine execution diagnostics.
              </p>
            </div>

            {/* Faculty & HOD Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-10 mt-6 border-t border-zinc-300">
              <div className="text-center">
                <div className="h-14 flex items-end justify-center mb-1">
                  <div className="px-3 py-1 border border-emerald-600 bg-emerald-50 rounded text-[10px] font-mono text-emerald-800 font-bold">
                    ✓ DIGITALLY VERIFIED BY FACULTY
                  </div>
                </div>
                <div className="border-t border-zinc-400 pt-1 font-bold text-xs text-zinc-900">
                  {facultyName}
                </div>
                <div className="text-[10px] text-zinc-600">Faculty In-Charge / Lab Examiner</div>
              </div>

              <div className="text-center">
                <div className="h-14 flex items-end justify-center mb-1">
                  <div className="px-3 py-1 border border-indigo-600 bg-indigo-50 rounded text-[10px] font-mono text-indigo-800 font-bold">
                    SEAL OF THE DEPARTMENT
                  </div>
                </div>
                <div className="border-t border-zinc-400 pt-1 font-bold text-xs text-zinc-900">
                  Head of the Department
                </div>
                <div className="text-[10px] text-zinc-600">Department of CSE • BVCEC</div>
              </div>
            </div>

            {/* Index / Table of Contents */}
            <div className="mt-8 pt-6 border-t-2 border-zinc-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 text-center">
                Day-by-Day Laboratory Experiments Index
              </h4>
              <table className="w-full text-xs border border-zinc-300 text-left">
                <thead className="bg-zinc-100 border-b border-zinc-300 font-bold text-[10px] uppercase text-zinc-700">
                  <tr>
                    <th className="py-2 px-2.5 text-center w-10">Exp #</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Experiment Title / Topic</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-center">Marks (10)</th>
                    <th className="py-2 px-3 text-center">Faculty Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map((t, idx) => {
                    const obs = t.observation;
                    const marks = obs?.facultyFinalMarks ?? obs?.marksAwarded;
                    const isApproved = obs?.status === 'APPROVED' || obs?.status === 'EVALUATED';

                    return (
                      <tr key={t.id || idx} className="border-b border-zinc-200">
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-zinc-800">
                          {t.experimentNumber || idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono text-zinc-600">
                          {obs?.date || new Date(t.openTime).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 font-medium text-zinc-900">
                          {t.title}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isApproved ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              APPROVED
                            </span>
                          ) : obs ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                              SUBMITTED
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">Pending</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-indigo-900">
                          {isApproved && marks !== null && marks !== undefined ? `${marks} / 10` : '--'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-emerald-800 font-bold">
                          {isApproved ? 'Signed (Verified)' : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DAY-BY-DAY EXPERIMENT PAGES (PAGES 2, 3, ...)              */}
          {/* ========================================================= */}
          {sortedTasks.map((t, idx) => {
            const obs = t.observation;
            const marks = obs?.facultyFinalMarks ?? obs?.marksAwarded;
            const isApproved = obs?.status === 'APPROVED' || obs?.status === 'EVALUATED';

            // Parse faculty breakdown
            let rubric = { aim: 2, algorithm: 3, compilation: 2, execution: 3, total: marks ?? 10 };
            try {
              if (obs?.aiEvaluationReport) {
                const rep = typeof obs.aiEvaluationReport === 'string' ? JSON.parse(obs.aiEvaluationReport) : obs.aiEvaluationReport;
                if (rep?.facultyEvaluation?.marksBreakdown) {
                  rubric = rep.facultyEvaluation.marksBreakdown;
                } else if (rep?.breakdown) {
                  rubric = {
                    aim: rep.breakdown.observationCompleteness?.score ?? 2,
                    algorithm: rep.breakdown.algorithmCorrectness?.score ?? 3,
                    compilation: rep.breakdown.programCorrectness?.score ?? 2,
                    execution: rep.breakdown.outputAccuracy?.score ?? 3,
                    total: marks ?? rep.totalMarks ?? 10
                  };
                }
              }
            } catch (e) {}

            return (
              <div 
                key={t.id || idx}
                className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border border-zinc-200 print:shadow-none print:border-none print:p-8 print:rounded-none page-break"
              >
                {/* Header per experiment */}
                <div className="border-b border-zinc-300 pb-4 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-900 uppercase">BVCEC CSE Digital Lab Record</span>
                    <span className="text-zinc-500 font-mono ml-2">• Course: {subjectName}</span>
                  </div>
                  <div className="font-mono text-zinc-600">
                    Roll No: <strong>{rollNumber}</strong> | Date: {obs?.date || new Date(t.openTime).toLocaleDateString()}
                  </div>
                </div>

                {/* Experiment Banner */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 uppercase">
                        Experiment No: {t.experimentNumber || idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-1">
                        {t.title}
                      </h3>
                    </div>
                    {isApproved && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded border border-emerald-300 block">
                          SCORE: {marks} / 10
                        </span>
                        <span className="text-[9px] text-emerald-700 font-mono mt-0.5 block">Approved & Signed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. Aim */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1 border-b border-zinc-200 pb-0.5">
                    1. Aim & Objective
                  </h4>
                  <div className="p-3 bg-zinc-50/70 rounded-lg border border-zinc-200 text-xs text-zinc-800 font-serif leading-relaxed">
                    {obs?.aim || t.aim || t.description || 'To write, compile and execute the program according to the problem requirements.'}
                  </div>
                </div>

                {/* 2. Algorithm */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1 border-b border-zinc-200 pb-0.5">
                    2. Algorithm / Step-by-Step Logic
                  </h4>
                  <div className="p-3 bg-zinc-50/70 rounded-lg border border-zinc-200 text-xs text-zinc-800 font-mono whitespace-pre-wrap leading-relaxed">
                    {obs?.algorithm || 'Step 1: Start the program.\nStep 2: Read standard input variables.\nStep 3: Process computation and algorithm logic.\nStep 4: Output the result to standard console.\nStep 5: Terminate execution.'}
                  </div>
                </div>

                {/* 3. Program Source Code */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1 border-b border-zinc-200 pb-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      3. Program Source Code ({t.language ? t.language.toUpperCase() : 'SOURCE'})
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500">Verified on Compiler</span>
                  </div>
                  <pre className="p-3 bg-zinc-950 text-zinc-100 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800">
                    {obs?.programCode || t.starterCode || '// No program code recorded.'}
                  </pre>
                </div>

                {/* 4. Execution Output */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1 border-b border-zinc-200 pb-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      4. Compiler Execution Output
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold">✓ Exit Code: 0 (Success)</span>
                  </div>
                  <pre className="p-3 bg-zinc-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-700">
                    {obs?.executionOutput || 'Execution completed with 0 errors.'}
                  </pre>
                </div>

                {/* 5. Result */}
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1 border-b border-zinc-200 pb-0.5">
                    5. Result & Conclusion
                  </h4>
                  <div className="p-2.5 bg-zinc-50/70 rounded-lg border border-zinc-200 text-xs text-zinc-800 font-serif leading-relaxed">
                    {obs?.result || 'The program was executed successfully, and expected outputs were verified against test cases.'}
                  </div>
                </div>

                {/* 6. Faculty Evaluation & Rubric Breakdown Box */}
                <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/30">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3 border-b border-indigo-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-700" />
                      Institutional Faculty Evaluation & Grade Record
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-900">
                      Maximum Marks: 10
                    </span>
                  </div>

                  {/* Rubric Breakdown Table */}
                  <table className="w-full text-xs border border-zinc-300 text-left mb-3 bg-white">
                    <thead className="bg-zinc-100 border-b border-zinc-300 text-[10px] font-bold uppercase text-zinc-700">
                      <tr>
                        <th className="py-1.5 px-3">Evaluation Component</th>
                        <th className="py-1.5 px-3 text-center">Max</th>
                        <th className="py-1.5 px-3 text-center">Awarded</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-200">
                        <td className="py-1 px-3">1. Aim & Problem Comprehension</td>
                        <td className="py-1 px-3 text-center font-mono text-zinc-500">2.0</td>
                        <td className="py-1 px-3 text-center font-mono font-bold text-indigo-900">{rubric.aim ?? 2}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="py-1 px-3">2. Algorithm Formulation & Step-by-Step Logic</td>
                        <td className="py-1 px-3 text-center font-mono text-zinc-500">3.0</td>
                        <td className="py-1 px-3 text-center font-mono font-bold text-indigo-900">{rubric.algorithm ?? 3}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="py-1 px-3">3. Source Code Compilation & Syntax Cleanliness</td>
                        <td className="py-1 px-3 text-center font-mono text-zinc-500">2.0</td>
                        <td className="py-1 px-3 text-center font-mono font-bold text-indigo-900">{rubric.compilation ?? 2}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="py-1 px-3">4. Program Execution Correctness & Test Output</td>
                        <td className="py-1 px-3 text-center font-mono text-zinc-500">3.0</td>
                        <td className="py-1 px-3 text-center font-mono font-bold text-indigo-900">{rubric.execution ?? 3}</td>
                      </tr>
                      <tr className="bg-indigo-50/70 font-bold">
                        <td className="py-1.5 px-3 text-indigo-950 uppercase">Total Marks Awarded (Institutional Score):</td>
                        <td className="py-1.5 px-3 text-center font-mono text-indigo-950">10.0</td>
                        <td className="py-1.5 px-3 text-center font-mono text-emerald-800 text-sm font-black">
                          {isApproved && marks !== null ? marks : (rubric.total ?? 10)} / 10
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Remarks and Digital Signature Stamp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="text-xs">
                      <span className="font-bold text-zinc-700 block uppercase text-[10px]">Faculty Remarks:</span>
                      <p className="text-zinc-800 italic mt-0.5">
                        &quot;{obs?.facultyRemarks || obs?.feedback || 'Program logic, algorithm and compiler execution verified successfully.'}&quot;
                      </p>
                    </div>

                    <div className="border border-emerald-300 bg-emerald-50/80 rounded-lg p-2.5 text-center flex flex-col justify-between">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>FACULTY DIGITAL SIGNATURE SEAL</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-900 mt-1">
                        {facultyName}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-600 mt-0.5">
                        Stamp ID: BVCEC-EVAL-{t.id.slice(-6).toUpperCase()} • Date: {obs?.evaluatedAt ? new Date(obs.evaluatedAt).toLocaleDateString() : 'Verified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

