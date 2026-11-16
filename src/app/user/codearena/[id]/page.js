import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import CodeArenaWorkspace from "./Workspace";

export const dynamic = 'force-dynamic';

export default async function ProblemPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const id = resolvedParams?.id;
  let taskId = resolvedSearch?.taskId;

  if (!taskId && id && id.startsWith('task-')) {
    taskId = id.replace('task-', '');
  }

  let task = null;
  if (taskId) {
    try {
      task = await db.task.findUnique({
        where: { id: taskId },
        include: {
          subject: true,
          section: true,
          faculty: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });
    } catch (e) {
      console.error("Error fetching task for workspace:", e);
    }
  }

  let problem = null;
  if (id && !id.startsWith('task-')) {
    try {
      problem = await db.problem.findUnique({
        where: { id: String(id) }
      });
    } catch (error) {
      console.error("Error fetching problem:", error);
    }
  }

  // If this is a task-based session, construct a problem object from the task
  if (task) {
    problem = {
      id: `task-${task.id}`,
      title: `Experiment ${task.experimentNumber}: ${task.title}`,
      difficulty: 'Medium',
      description: `### Experiment Objective\n${task.aim || task.description}\n\n### Instructions\n${task.instructions || 'Execute cleanly and submit digital observation.'}`,
      points: task.maxMarks || 20,
      isTask: true,
      taskId: task.id
    };
  } else if (!problem) {
    try {
      problem = await db.problem.findFirst();
    } catch (e) {
      console.error("Error fetching fallback problem:", e);
    }
  }

  if (!problem) {
    problem = {
      id: id || "sample-problem",
      title: "Sample Programming Experiment",
      difficulty: "Easy",
      description: "Write and execute your code in the editor.",
      points: 10
    };
  }

  return <CodeArenaWorkspace problem={problem} initialTask={task} />;
}
