"use client";

import { useState } from "react";
import { 
  GraduationCap, 
  ArrowLeft, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  FileCode, 
  Award, 
  ChevronRight, 
  Play, 
  ExternalLink,
  Sparkles,
  Share2
} from "lucide-react";
import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";

const COURSES_DATA = [
  {
    id: "course-1",
    title: "Advanced React 19 & Next.js Architecture",
    instructor: "Bhanu Prakash",
    duration: "4h 30m",
    level: "Advanced",
    category: "Full Stack Development",
    lessons: [
      { 
        id: 1, 
        title: "Server vs Client Components Deep-Dive", 
        duration: "18 mins", 
        youtubeId: "wm5gXB33950",
        notes: "Learn how React Server Components (RSC) run entirely on the server, producing zero-bundle-size client packages and enabling secure database access without exposing credentials."
      },
      { 
        id: 2, 
        title: "Streaming with Suspense & Loading Boundaries", 
        duration: "24 mins", 
        youtubeId: "bMknfKXIFA8",
        notes: "Master progressive SSR streaming using Suspense boundaries. Send instant skeleton chrome to the browser while heavy server queries stream in asynchronously."
      },
      { 
        id: 3, 
        title: "Server Actions & Optimistic Mutations", 
        duration: "32 mins", 
        youtubeId: "d5x0JCbQeDQ",
        notes: "Eliminate repetitive boilerplate REST endpoints by writing native async Server Actions with useOptimistic and useActionState."
      },
      { 
        id: 4, 
        title: "Route Handlers & Edge Runtime Middleware", 
        duration: "28 mins", 
        youtubeId: "843nec-IvW0",
        notes: "Implement high-performance Edge middleware for session token validation, geolocation routing, and rate limiting."
      },
      { 
        id: 5, 
        title: "Zero-Downtime Deployment & Caching", 
        duration: "45 mins", 
        youtubeId: "ZVnjOPwW4VY",
        notes: "Architect production deployment pipelines with ISR (Incremental Static Regeneration), Docker containers, and edge reverse proxies."
      },
    ]
  },
  {
    id: "course-2",
    title: "Data Structures & Algorithmic Patterns",
    instructor: "NextGen Labs Algorithms Team",
    duration: "8h 15m",
    level: "Intermediate",
    category: "Competitive Programming",
    lessons: [
      { 
        id: 1, 
        title: "Two-Pointer and Sliding Window Masterclass", 
        duration: "35 mins", 
        youtubeId: "On03HWe2tZM",
        notes: "Master linear array reductions from O(n²) to O(n) using dynamic sliding window techniques for subarray sum and substring problems."
      },
      { 
        id: 2, 
        title: "Fast and Slow Pointers (Floyd's Cycle Detection)", 
        duration: "25 mins", 
        youtubeId: "gBTe7lFR3vc",
        notes: "Understand the mathematical proof behind Tortoise and Hare algorithm for detecting cycles in linked lists and arrays."
      },
      { 
        id: 3, 
        title: "Monotonic Stacks & Next Greater Element", 
        duration: "40 mins", 
        youtubeId: "Dq_ITV1KO3c",
        notes: "Solve daily temperature, stock span, and largest rectangle in histogram problems using strictly increasing/decreasing monotonic stacks."
      },
      { 
        id: 4, 
        title: "Dynamic Programming: Memoization vs Tabulation", 
        duration: "50 mins", 
        youtubeId: "oBt53YbR9K3",
        notes: "Comprehensive DP guide: Identifying overlapping subproblems, formulating state transition equations, and memory space optimization."
      },
    ]
  },
  {
    id: "course-3",
    title: "Cybersecurity & Web Exploitation",
    instructor: "SecOps Core Group",
    duration: "6h 00m",
    level: "All Levels",
    category: "Information Security",
    lessons: [
      { 
        id: 1, 
        title: "OWASP Top 10 Vulnerability Dissection", 
        duration: "30 mins", 
        youtubeId: "WnN6dbos5u8",
        notes: "Comprehensive breakdown of the critical web application security risks including Broken Access Control, Cryptographic Failures, and Insecure Design."
      },
      { 
        id: 2, 
        title: "SQL Injection: Exploitation & Defense", 
        duration: "42 mins", 
        youtubeId: "ciNHn38EyRc",
        notes: "Hands-on analysis of Union-based, Error-based, and Blind SQL injection with parameterized query remediation."
      },
      { 
        id: 3, 
        title: "Cross-Site Scripting (XSS) & CSP Hardening", 
        duration: "38 mins", 
        youtubeId: "EoaDgUgS6QA",
        notes: "Differences between Stored, Reflected, and DOM-based XSS attacks with nonce-based Content Security Policy mitigations."
      },
      { 
        id: 4, 
        title: "JWT Token Security & Session Management", 
        duration: "45 mins", 
        youtubeId: "7Q17ubqL20A",
        notes: "Preventing token theft, algorithm switching attacks, and implementing secure HttpOnly SameSite cookie sessions."
      },
    ]
  },
  {
    id: "course-4",
    title: "System Design & Distributed Architecture",
    instructor: "Cloud Architecture Lead",
    duration: "7h 20m",
    level: "Advanced",
    category: "System Design",
    lessons: [
      { 
        id: 1, 
        title: "System Design Fundamentals & Scalability", 
        duration: "40 mins", 
        youtubeId: "m8Icp_Cid5o",
        notes: "Vertical vs horizontal scaling, load balancers (L4 vs L7), reverse proxies, and CDN caching strategies."
      },
      { 
        id: 2, 
        title: "Distributed Caching with Redis & Memcached", 
        duration: "35 mins", 
        youtubeId: "jgpVdJB2yKQ",
        notes: "Cache eviction policies (LRU/LFU), Cache Aside, Write-Through, Write-Back, and cache stampede prevention."
      },
      { 
        id: 3, 
        title: "Database Sharding, Partitioning & Replication", 
        duration: "45 mins", 
        youtubeId: "5faMjKuB9bc",
        notes: "Master-slave replication, consistent hashing for sharding keys, and managing cross-shard transactions."
      },
    ]
  }
];

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState(COURSES_DATA[0]);
  const [activeLesson, setActiveLesson] = useState(COURSES_DATA[0].lessons[0]);
  const [completedLessonsMap, setCompletedLessonsMap] = useState({
    "course-1-1": true,
    "course-1-2": true,
    "course-2-1": true,
  });

  const toggleLessonComplete = (lessonId) => {
    const key = `${selectedCourse.id}-${lessonId}`;
    setCompletedLessonsMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setActiveLesson(course.lessons[0]);
  };

  const completedCount = selectedCourse.lessons.filter(l => completedLessonsMap[`${selectedCourse.id}-${l.id}`]).length;
  const progressPct = Math.round((completedCount / selectedCourse.lessons.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Youtube className="w-6 h-6 text-red-500" />
              Curated Video Lecture Masterclasses
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Stream high-definition technical courses with interactive lesson switching and progress tracking.</p>
          </div>
        </div>

        {/* Course Category Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Course: <strong className="text-zinc-100">{selectedCourse.category}</strong></span>
        </div>
      </div>

      {/* Course Selector Cards Carousel/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COURSES_DATA.map((course) => {
          const isSelected = selectedCourse.id === course.id;
          const courseCompletedCount = course.lessons.filter(l => completedLessonsMap[`${course.id}-${l.id}`]).length;
          const coursePct = Math.round((courseCompletedCount / course.lessons.length) * 100);

          return (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2 font-mono">
                  <span className="text-red-400 font-semibold">{course.level}</span>
                  <span>{course.duration}</span>
                </div>
                <h3 className="font-bold text-zinc-50 text-sm mb-1.5 line-clamp-1">{course.title}</h3>
                <p className="text-[11px] text-zinc-400 mb-3 truncate">{course.instructor}</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                  <span>{courseCompletedCount}/{course.lessons.length} Lessons</span>
                  <span>{coursePct}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${coursePct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Video Theatre & Lesson Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Embedded YouTube Player & Lesson Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* 16:9 Responsive Video Player Box */}
          <div className="w-full bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative aspect-video">
            <iframe
              key={activeLesson.youtubeId}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Active Lesson Header & Controls */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                  {selectedCourse.title}
                </span>
                <h2 className="text-xl font-bold text-zinc-50 mt-0.5">{activeLesson.title}</h2>
                <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-500" /> Duration: {activeLesson.duration}</span>
                  <span>•</span>
                  <span>Instructor: {selectedCourse.instructor}</span>
                </div>
              </div>

              <button
                onClick={() => toggleLessonComplete(activeLesson.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                  completedLessonsMap[`${selectedCourse.id}-${activeLesson.id}`]
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{completedLessonsMap[`${selectedCourse.id}-${activeLesson.id}`] ? 'Completed ✓' : 'Mark Lesson Complete'}</span>
              </button>
            </div>

            {/* Lecture Notes */}
            <div>
              <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-red-400" /> Lecture Key Concepts & Engineering Notes:
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80">
                {activeLesson.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Course Syllabus & Video Selector Drawer */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-zinc-50 text-base">Course Curriculum</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{completedCount} of {selectedCourse.lessons.length} Lessons Finished</p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-red-400">{progressPct}%</span>
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Progress</span>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {selectedCourse.lessons.map((lesson, idx) => {
                const isCurrent = activeLesson.id === lesson.id;
                const isCompleted = completedLessonsMap[`${selectedCourse.id}-${lesson.id}`];

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-red-500/15 border-red-500 text-red-200 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCompleted 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : isCurrent
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-zinc-50' : 'text-zinc-300'}`}>
                          {lesson.title}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {lesson.duration}
                        </span>
                      </div>
                    </div>

                    <Play className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-red-400 fill-red-400' : 'text-zinc-600'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Practice Link */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <Link
              href="/user/codearena"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Practice in CodeArena</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/user/practice"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Solve MCQ Drills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
