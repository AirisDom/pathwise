"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import LumiChat from "@/components/student/LumiChat";
import {
  BookOpen,
  CalendarBlank,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  CircleNotch,
  Target,
  Trophy,
  TrendUp,
  Lightning,
  Star,
  Compass,
  FunnelSimple,
  SortAscending,
  SortDescending,
  MagnifyingGlass,
  ArrowRight,
  Medal,
} from "@phosphor-icons/react";

// ── Types ─────────────────────────────────────────────────────────

interface ProgressData {
  stats: {
    totalEnrolled: number;
    inProgress: number;
    completed: number;
    totalLessonsCompleted: number;
    totalHoursLearned: number;
    currentStreak: number;
  };
  recentCourses: {
    enrollmentId: string;
    courseId: string;
    slug: string;
    title: string;
    thumbnail: string | null;
    category: string;
    level: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    lastAccessedAt: string | null;
    enrolledAt?: string;
  }[];
  completedCourses: {
    enrollmentId: string;
    courseId: string;
    slug: string;
    title: string;
    thumbnail: string | null;
    category: string;
    creator: { id: string; name: string | null; image: string | null };
    completedAt: string | null;
  }[];
}

type SortKey = "progress" | "lessons" | "recent" | "title";
type SortDir = "asc" | "desc";

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── GitHub-style heatmap (real data derived from lesson completions) ──

function buildActivityGrid(courses: ProgressData["recentCourses"]): Map<string, number> {
  // We only have lastAccessedAt per course — use that to mark activity days
  const map = new Map<string, number>();
  courses.forEach((c) => {
    if (c.lastAccessedAt) {
      const key = c.lastAccessedAt.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + Math.max(1, c.completedLessons));
    }
  });
  return map;
}

function ActivityHeatmap({ courses }: { courses: ProgressData["recentCourses"] }) {
  const activityMap = useMemo(() => buildActivityGrid(courses), [courses]);

  // Build 15 weeks × 7 days = 105 cells ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: { date: Date; key: string; count: number }[] = [];
  for (let i = 104; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: d, key, count: activityMap.get(key) ?? 0 });
  }

  // Group into weeks (columns)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // Derive month labels per column
  const monthLabels = weeks.map((w) => {
    const first = w[0]?.date;
    return first?.getDate() <= 7 ? months[first.getMonth()] : "";
  });

  const getColor = (count: number) => {
    if (count === 0) return "bg-blue-50";
    if (count <= 2) return "bg-blue-200";
    if (count <= 5) return "bg-blue-400";
    if (count <= 10) return "bg-blue-600";
    return "bg-blue-800";
  };

  const activeDays = cells.filter((c) => c.count > 0).length;

  return (
    <div>
      {/* Month labels */}
      <div className="flex gap-1 mb-1 pl-0.5">
        {monthLabels.map((m, i) => (
          <div key={i} className="w-3.5 text-[9px] text-gray-400 shrink-0">{m}</div>
        ))}
      </div>

      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} — ${cell.count} activity`}
                className={`w-3.5 h-3.5 rounded-sm ${getColor(cell.count)} transition-colors cursor-default`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-blue-600">{activeDays}</span> active days in the last 15 weeks
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">Less</span>
          {["bg-blue-50","bg-blue-200","bg-blue-400","bg-blue-600","bg-blue-800"].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}

// ── Progress ring ──────────────────────────────────────────────────

function CompletionRing({ pct }: { pct: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        {/* Track */}
        <circle cx="90" cy="90" r={r} stroke="#dbeafe" strokeWidth="12" fill="none" />
        {/* Blue fill */}
        <circle
          cx="90" cy="90" r={r}
          stroke="url(#blueRingGrad)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="blueRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-gray-900 leading-none">{pct}%</span>
        <span className="text-xs text-gray-400 mt-1 font-medium">completion rate</span>
      </div>
    </div>
  );
}

// ── Achievement badge (vertical card) ─────────────────────────────

function AchievementCard({
  name, desc, icon: Icon, earned, earnedColor,
}: {
  name: string; desc: string; icon: React.ElementType; earned: boolean; earnedColor: string;
}) {
  return (
    <div className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
      earned
        ? `border-amber-200 bg-linear-to-b from-amber-50 to-white shadow-sm`
        : "border-gray-100 bg-gray-50/60 opacity-50"
    }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
        earned ? "bg-amber-100 shadow-inner" : "bg-gray-200"
      }`}>
        <Icon className={`w-6 h-6 ${earned ? earnedColor : "text-gray-400"}`} weight="fill" />
      </div>
      <p className={`text-xs font-bold leading-tight mb-1 ${earned ? "text-gray-900" : "text-gray-500"}`}>
        {name}
      </p>
      <p className="text-[10px] text-gray-400 leading-tight">{desc}</p>
      {earned && (
        <span className="mt-2 inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-2.5 h-2.5" weight="fill" /> Earned
        </span>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export default function StudentProgress() {
  const { status } = useSession();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  // Course progress filters
  const [progressFilter, setProgressFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [progressSearch, setProgressSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") fetchProgress();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <CircleNotch className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      </StudentLayout>
    );
  }

  const stats = data?.stats ?? {
    totalEnrolled: 0, inProgress: 0, completed: 0,
    totalLessonsCompleted: 0, totalHoursLearned: 0, currentStreak: 0,
  };

  const completionRate = stats.totalEnrolled > 0
    ? Math.round((stats.completed / stats.totalEnrolled) * 100)
    : 0;

  // All courses for progress list (in-progress from recentCourses + completed)
  type ProgressCourse = {
    enrollmentId: string;
    slug: string;
    title: string;
    thumbnail: string | null;
    category: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    lastAccessedAt: string | null;
    isCompleted: boolean;
  };

  const allProgressCourses: ProgressCourse[] = [
    ...(data?.recentCourses ?? []).map((c) => ({ ...c, isCompleted: false })),
    ...(data?.completedCourses ?? []).map((c) => ({
      enrollmentId: c.enrollmentId,
      slug: c.slug,
      title: c.title,
      thumbnail: c.thumbnail,
      category: c.category,
      progress: 100,
      totalLessons: 0,
      completedLessons: 0,
      lastAccessedAt: c.completedAt,
      isCompleted: true,
    })),
  ];

  const filteredCourses = allProgressCourses
    .filter((c) => {
      if (progressFilter === "in-progress") return !c.isCompleted;
      if (progressFilter === "completed") return c.isCompleted;
      return true;
    })
    .filter((c) =>
      progressSearch === "" || c.title.toLowerCase().includes(progressSearch.toLowerCase()) || c.category.toLowerCase().includes(progressSearch.toLowerCase())
    )
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "progress") diff = a.progress - b.progress;
      else if (sortKey === "lessons") diff = a.completedLessons - b.completedLessons;
      else if (sortKey === "recent") diff = new Date(a.lastAccessedAt ?? 0).getTime() - new Date(b.lastAccessedAt ?? 0).getTime();
      else if (sortKey === "title") diff = a.title.localeCompare(b.title);
      return sortDir === "asc" ? diff : -diff;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const achievements = [
    { name: "First Steps", desc: "Enrol in your first course", icon: Lightning, earned: stats.totalEnrolled > 0, earnedColor: "text-blue-600" },
    { name: "Dedicated", desc: "Complete 5 lessons", icon: Target, earned: stats.totalLessonsCompleted >= 5, earnedColor: "text-indigo-600" },
    { name: "Achiever", desc: "Finish your first course", icon: Trophy, earned: stats.completed > 0, earnedColor: "text-amber-600" },
    { name: "Scholar", desc: "Enrol in 3+ courses", icon: GraduationCap, earned: stats.totalEnrolled >= 3, earnedColor: "text-emerald-600" },
    { name: "On Fire", desc: "7-day learning streak", icon: Flame, earned: stats.currentStreak >= 7, earnedColor: "text-orange-500" },
    { name: "Reviewer", desc: "Leave your first review", icon: Star, earned: false, earnedColor: "text-yellow-500" },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50/50">

        {/* ── PAGE HEADER ── */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">My Progress</h1>
              <p className="text-gray-500 text-sm">Track your learning milestones and achievements</p>
            </div>
            <Link
              href="/StudentBrowse"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
              <Compass className="w-4 h-4" />
              Browse More Courses
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">

          {/* ── STAT STRIP (dashboard style) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

            {/* Enrolled — solid blue */}
            <div className="relative bg-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-200 overflow-hidden flex flex-col justify-between min-h-28">
              <svg className="absolute -right-3 -top-3 opacity-10" width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="60" cy="20" r="32" fill="white"/>
                <circle cx="40" cy="50" r="22" fill="white"/>
              </svg>
              <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-widest">Enrolled</p>
              <div>
                <p className="text-4xl font-black text-white tracking-tight leading-none">{stats.totalEnrolled}</p>
                <p className="text-[10px] text-blue-300 mt-1 font-medium">total courses</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col justify-between min-h-28">
              <svg className="absolute -right-2 -bottom-2 opacity-[0.07]" width="70" height="70" viewBox="0 0 70 70" fill="none">
                <path d="M35 8 L62 55 L8 55 Z" fill="#7c3aed"/>
                <path d="M35 22 L55 52 L15 52 Z" fill="#7c3aed"/>
              </svg>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-widest">In Progress</p>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 tracking-tight leading-none">{stats.inProgress}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">active now</p>
              </div>
            </div>

            {/* Completed */}
            <div className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col justify-between min-h-28">
              <svg className="absolute -right-1 -bottom-1 opacity-[0.07]" width="70" height="70" viewBox="0 0 70 70" fill="none">
                <rect x="8" y="8" width="54" height="54" rx="10" fill="#059669"/>
                <path d="M22 35 L31 44 L48 27" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">Completed</p>
              <div>
                <p className="text-4xl font-black text-gray-900 tracking-tight leading-none">{stats.completed}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">courses done</p>
              </div>
            </div>

            {/* Lessons Done */}
            <div className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col justify-between min-h-28">
              <svg className="absolute -right-2 -bottom-2 opacity-[0.07]" width="70" height="70" viewBox="0 0 70 70" fill="none">
                <circle cx="35" cy="35" r="28" fill="#2563eb"/>
                <circle cx="35" cy="35" r="16" fill="#2563eb"/>
                <circle cx="35" cy="35" r="6" fill="#2563eb"/>
              </svg>
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest">Lessons Done</p>
              <div>
                <p className="text-4xl font-black text-gray-900 tracking-tight leading-none">{stats.totalLessonsCompleted}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">lessons completed</p>
              </div>
            </div>

            {/* Hours Learned */}
            <div className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col justify-between min-h-28">
              <svg className="absolute -right-1 -bottom-1 opacity-[0.07]" width="70" height="70" viewBox="0 0 70 70" fill="none">
                <circle cx="35" cy="35" r="28" fill="#d97706"/>
                <circle cx="35" cy="35" r="18" fill="#d97706"/>
                <line x1="35" y1="14" x2="35" y2="35" stroke="#d97706" strokeWidth="4" strokeLinecap="round"/>
                <line x1="35" y1="35" x2="49" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest">Hours Learned</p>
              <div>
                <p className="text-4xl font-black text-gray-900 tracking-tight leading-none">{stats.totalHoursLearned}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">watch time</p>
              </div>
            </div>

            {/* Streak */}
            <div className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col justify-between min-h-28">
              <svg className="absolute -right-2 -bottom-2 opacity-[0.07]" width="70" height="70" viewBox="0 0 70 70" fill="none">
                <path d="M35 8 C20 20 12 32 22 44 C18 36 28 30 28 30 C26 42 34 52 42 56 C36 50 44 38 44 38 C48 46 46 56 40 62 C56 52 62 36 50 22 C54 28 52 36 48 40 C48 28 40 18 35 8Z" fill="#ea580c"/>
              </svg>
              <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest">Day Streak</p>
              <div>
                <p className="text-4xl font-black text-gray-900 tracking-tight leading-none">{stats.currentStreak}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">days in a row</p>
              </div>
            </div>

          </div>

          {/* ── MIDDLE ROW: Completion Ring + Heatmap ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Completion Rate */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-700 mb-4 self-start">Completion Rate</h3>
              <CompletionRing pct={completionRate} />
              <div className="w-full mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-100" />
                    <span className="text-gray-600">In Progress</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.inProgress}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Completion rate</span>
                  <span className="font-black text-blue-600 text-sm">{completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Learning Activity Heatmap */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-gray-700">Learning Activity</h3>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">Last 15 weeks</span>
              </div>
              {(data?.recentCourses ?? []).length > 0 ? (
                <ActivityHeatmap courses={data!.recentCourses} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarBlank className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No activity yet</p>
                  <p className="text-xs text-gray-300 mt-1">Start learning to build your streak</p>
                </div>
              )}
            </div>
          </div>

          {/* ── COURSE PROGRESS LIST ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800">Course Progress</h3>
                <p className="text-xs text-gray-400 mt-0.5">{filteredCourses.length} courses</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={progressSearch}
                    onChange={(e) => setProgressSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-36"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  {(["all", "in-progress", "completed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setProgressFilter(f)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                        progressFilter === f ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {f === "in-progress" ? "In Progress" : f === "completed" ? "Completed" : "All"}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5 bg-white">
                  {(["progress","lessons","recent","title"] as SortKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => toggleSort(k)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        sortKey === k ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {k === "recent" ? "Recent" : k === "title" ? "A–Z" : k === "lessons" ? "Lessons" : "Progress"}
                      {sortKey === k && (sortDir === "desc"
                        ? <SortDescending className="w-3 h-3" />
                        : <SortAscending className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows */}
            {filteredCourses.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                No courses match your filter.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredCourses.map((course) => {
                  const pct = Math.round(course.progress);
                  return (
                    <div key={course.enrollmentId} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-blue-50">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Link href={`/courses/${course.slug}/learn`}>
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {course.title}
                            </p>
                          </Link>
                          {course.isCompleted && (
                            <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" weight="fill" /> Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {course.category}
                          {!course.isCompleted && course.totalLessons > 0 && (
                            <> · {course.completedLessons}/{course.totalLessons} lessons</>
                          )}
                          {course.lastAccessedAt && (
                            <> · <Clock className="w-2.5 h-2.5 inline-block mr-0.5" />{timeAgo(course.lastAccessedAt)}</>
                          )}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-40 shrink-0 hidden sm:block">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className={`font-bold ${pct === 100 ? "text-emerald-600" : "text-blue-600"}`}>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              pct === 100
                                ? "bg-linear-to-r from-emerald-400 to-teal-500"
                                : "bg-linear-to-r from-blue-400 to-indigo-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/courses/${course.slug}/learn`}
                        className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          course.isCompleted
                            ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            : pct === 0
                            ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                            : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        {course.isCompleted ? (
                          <>Review <ArrowRight className="w-3 h-3" /></>
                        ) : pct === 0 ? (
                          <>Start <ArrowRight className="w-3 h-3" /></>
                        ) : (
                          <>Continue <ArrowRight className="w-3 h-3" /></>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── ACHIEVEMENTS (vertical portrait cards) ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" weight="fill" />
                <h3 className="text-sm font-bold text-gray-800">Achievements</h3>
              </div>
              <span className="text-xs bg-amber-50 border border-amber-100 text-amber-600 font-semibold px-2.5 py-1 rounded-full">
                {earnedCount} / {achievements.length} earned
              </span>
            </div>

            {/* Vertical portrait cards in a row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {achievements.map((a) => (
                <AchievementCard key={a.name} {...a} />
              ))}
            </div>
          </div>

        </div>
      </div>
      <LumiChat />
    </StudentLayout>
  );
}
