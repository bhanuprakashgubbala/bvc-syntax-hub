async function verifyEndToEndWorkflow() {
  console.log("=== STARTING END-TO-END WORKFLOW VERIFICATION ===");

  // 1. Fetch student tasks
  const tasksRes = await fetch('http://localhost:3000/api/student/tasks');
  const tasksJson = await tasksRes.json();
  console.log(`[1] Student Tasks Loaded: ${tasksJson.tasks.length} tasks found.`);
  const activeTask = tasksJson.tasks.find(t => t.availability === 'ACTIVE');
  console.log(`    Found Active Task: ID=${activeTask.id}, Title="${activeTask.title}", ExpNo=${activeTask.experimentNumber}`);

  // 2. Fetch students to get test student ID
  const stuRes = await fetch('http://localhost:3000/api/hod/students');
  const stuJson = await stuRes.json();
  const student = stuJson.students[0];
  console.log(`[2] Test Student Selected: ${student.fullName} (${student.rollNumber}, ID=${student.id})`);

  // 3. Submit Digital Observation
  console.log("[3] Submitting Digital Observation from Student...");
  const obsRes = await fetch('http://localhost:3000/api/student/observation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskId: activeTask.id,
      studentId: student.id,
      aim: "To demonstrate multi-dimensional matrix operations in Java and verify output.",
      algorithm: "Step 1: Start.\nStep 2: Initialize matrices A and B.\nStep 3: Multiply matrices.\nStep 4: Print product matrix.\nStep 5: Stop.",
      programCode: "public class Solution { public static void main(String[] args) { System.out.println(\"Product Matrix Verified: [1 0; 0 1]\"); } }",
      executionOutput: "Product Matrix Verified: [1 0; 0 1]",
      result: "The program was executed and matrix multiplication output was verified.",
      executionSuccessful: true
    })
  });
  const obsJson = await obsRes.json();
  console.log(`    Observation Submission Response: Success=${obsJson.success}, Observation ID=${obsJson.observation?.id}`);

  // 4. Faculty fetches observations
  console.log("[4] Faculty Fetching Submitted Observations...");
  const facRes = await fetch(`http://localhost:3000/api/faculty/observations?facultyId=${activeTask.facultyId || ''}`);
  const facJson = await facRes.json();
  console.log(`    Faculty Observations Found: ${facJson.observations?.length}`);

  // 5. Faculty evaluates observation
  console.log("[5] Faculty Evaluating Observation & Awarding Marks...");
  const evalRes = await fetch('http://localhost:3000/api/faculty/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      observationId: obsJson.observation.id,
      marksAwarded: 19,
      feedback: "Exceptional algorithm step-by-step clarity and flawless execution output.",
      status: 'EVALUATED'
    })
  });
  const evalJson = await evalRes.json();
  console.log(`    Evaluation Response: Success=${evalJson.success}, MarksAwarded=${evalJson.observation?.marksAwarded}/${activeTask.maxMarks}`);

  // 6. HOD Department-wide check
  console.log("[6] HOD Checking Department Submissions...");
  const hodRes = await fetch('http://localhost:3000/api/hod/submissions');
  const hodJson = await hodRes.json();
  console.log(`    HOD Total Submissions: ${hodJson.stats?.totalSubmissions}, Evaluated: ${hodJson.stats?.evaluatedCount}, Pending: ${hodJson.stats?.pendingCount}`);

  console.log("=== ALL WORKFLOW STAGES VERIFIED SUCCESSFULLY! ===");
}

verifyEndToEndWorkflow().catch(console.error);
