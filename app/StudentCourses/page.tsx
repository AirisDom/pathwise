"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import LumiChat from "@/components/student/LumiChat";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  CircleNotch,
  PlayCircle,
  MagnifyingGlass,
  Trophy,
  TrendUp,
  GraduationCap,
  Star,
  ListBullets,
  SquaresFour,
  Play,
  ArrowRight,
  Medal,
  Lightning,
  Calendar,
} from "@phosphor-icons/react";

interface StudentCourse {
  enrollmentId: string;
  courseId: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail: string | null;
  category: string;
  level: string;
  creator: { id: string; name: string | null; image: string | null };
  progress: number;
  totalLessons: number;
  completedLessons: number;
  isCompleted: boolean;
  lastAccessedAt: string | null;
  enrolledAt: string;
  completedAt: string | null;
}

type FilterType = "all" | "in-progress" | "completed";

const getLevelConfig = (lvl: string) => {
  switch (lvl) {
    case "BEGINNER":
      return { color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", label: "Beginner" };
    case "INTERMEDIATE":
      return { color: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500", label: "Intermediate" };
    case "ADVANCED":
      return { color: "text-purple-700 bg-purple-50 border-purple-200", dot: "bg-purple-500", label: "Advanced" };
    default:
      return { color: "text-gray-700 bg-gray-50 border-gray-200", dot: "bg-gray-400", label: lvl.replace("_", " ") };
  }
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(dateStr);
}

function ProgressRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={5} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={pct === 100 ? "#10b981" : "#3b82f6"}
        strokeWidth={5}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function CourseRowCard({ course }: { course: StudentCourse }) {
  const levelCfg = getLevelConfig(course.level);
  const pct = Math.round(course.progress);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-[0_8px_40px_-8px_rgba(37,99,235,0.15)] transition-all duration-300 flex">
      {/* Thumbnail */}
      <Link href={`/courses/${course.slug}/learn`} className="shrink-0 relative w-52 lg:w-60 xl:w-64 overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 transition-all duration-300 flex items-center justify-center scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 shadow-lg">
            <Play className="w-5 h-5 text-blue-600 ml-0.5" weight="fill" />
          </div>
        </div>

        {/* Completed ribbon */}
        {course.isCompleted && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            <Trophy className="w-3 h-3" weight="fill" />
            Completed
          </div>
        )}

        {/* Progress bar */}
        {!course.isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-5 lg:p-6 flex flex-col min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
            {course.category}
          </span>
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${levelCfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${levelCfg.dot}`} />
            {levelCfg.label}
          </span>
        </div>

        {/* Title */}
        <Link href={`/courses/${course.slug}/learn`}>
          <h3 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors mb-1 leading-tight">
            {course.title}
          </h3>
        </Link>

        {course.subtitle && (
          <p className="text-sm text-gray-400 line-clamp-1 mb-3">{course.subtitle}</p>
        )}

        {/* Creator */}
        <div className="flex items-center gap-1.5 mb-4">
          {course.creator.image ? (
            <img src={course.creator.image} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">{course.creator.name?.charAt(0) ?? "?"}</span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            By <span className="font-medium text-gray-700">{course.creator.name}</span>
          </span>
        </div>

        {/* Progress section */}
        {course.isCompleted ? (
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative">
                <ProgressRing pct={100} size={40} />
                <CheckCircle className="absolute inset-0 m-auto w-3.5 h-3.5 text-emerald-500" weight="fill" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600">100% Complete</p>
                <p className="text-xs text-gray-400">{course.totalLessons} lessons finished</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 text-amber-400" weight="fill" />
                <span className="font-medium text-gray-600">Completed {formatDate(course.completedAt)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Enrolled {formatDate(course.enrolledAt)}
              </span>
            </div>

            <Link href={`/courses/${course.slug}/learn`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-100 px-4" size="sm">
                Review
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-auto">
            {/* Progress ring + label */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative">
                <ProgressRing pct={pct} size={40} />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-blue-600">
                  {pct}%
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {course.completedLessons} / {course.totalLessons} lessons
                </p>
                {course.lastAccessedAt && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(course.lastAccessedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Bar */}
            <div className="flex-1 max-w-48 hidden sm:block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-semibold text-blue-600">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-blue-400 to-indigo-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <Link href={`/courses/${course.slug}/learn`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100 px-4" size="sm">
                {pct === 0 ? (
                  <>
                    <Lightning className="w-3.5 h-3.5 mr-1.5" weight="fill" />
                    Start
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5 mr-1.5" weight="fill" />
                    Continue
                  </>
                )}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Accent bar */}
      <div className={`w-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-b ${course.isCompleted ? "from-emerald-300 to-teal-400" : "from-blue-300 via-indigo-300 to-purple-300"}`} />
    </div>
  );
}

function CourseGridCard({ course }: { course: StudentCourse }) {
  const levelCfg = getLevelConfig(course.level);
  const pct = Math.round(course.progress);

  return (
    <Link
      href={`/courses/${course.slug}/learn`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-[0_8px_30px_-8px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
            <BookOpen className="w-10 h-10 text-blue-300" />
          </div>
        )}

        {course.isCompleted && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            <Trophy className="w-3 h-3" weight="fill" />
            Done
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 transition-all duration-300 flex items-center justify-center scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 shadow-lg">
            <Play className="w-5 h-5 text-blue-600 ml-0.5" weight="fill" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className={`h-full transition-all duration-700 ${course.isCompleted ? "bg-emerald-400" : "bg-blue-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            {course.category}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${levelCfg.color}`}>
            <span className={`w-1 h-1 rounded-full ${levelCfg.dot}`} />
            {levelCfg.label}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-gray-400 mb-3">{course.creator.name}</p>

        <div className="mt-auto space-y-2">
          {course.isCompleted ? (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                Completed {formatDate(course.completedAt)}
              </span>
              <span className="text-gray-400">{course.totalLessons} lessons</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} lessons</span>
                <span className="font-bold text-blue-600">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-blue-400 to-indigo-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {course.lastAccessedAt && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(course.lastAccessedAt)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function CourseSkeleton({ view }: { view: "list" | "grid" }) {
  if (view === "list") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-40 animate-pulse">
        <div className="w-60 shrink-0 bg-gray-200" />
        <div className="flex-1 p-6 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="mt-auto flex gap-4">
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded-full" />
          <div className="h-4 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
        <div className="h-2 bg-gray-100 rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function StudentCourses() {
  const { status } = useSession();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetchCourses();
  }, [filter, status]);

  async function fetchCourses() {
    if (status !== "authenticated") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("filter", filter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/student/courses?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data.courses);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const filterTabs: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
    { key: "all", label: "All Courses", icon: BookOpen, color: "text-gray-600" },
    { key: "in-progress", label: "In Progress", icon: TrendUp, color: "text-blue-600" },
    { key: "completed", label: "Completed", icon: Trophy, color: "text-emerald-600" },
  ];

  // Count per filter (simple client-side)
  const counts = {
    all: courses.length,
    "in-progress": courses.filter((c) => !c.isCompleted).length,
    completed: courses.filter((c) => c.isCompleted).length,
  };

  const avgProgress = courses.length
    ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length)
    : 0;

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50/50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">My Courses</h1>
              <p className="text-gray-500 text-sm">Track your learning journey and pick up where you left off</p>
            </div>

            {/* Quick stats */}
            {!loading && courses.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-600">{courses.length}</p>
                  <p className="text-[11px] text-gray-400 font-medium">Enrolled</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-600">{counts.completed}</p>
                  <p className="text-[11px] text-gray-400 font-medium">Completed</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-600">{avgProgress}%</p>
                  <p className="text-[11px] text-gray-400 font-medium">Avg Progress</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100">
                  <Link href="/StudentBrowse">
                    <Compass className="w-4 h-4 mr-2" />
                    Browse More
                  </Link>
                </Button>
              </div>
            )}

            {!loading && courses.length === 0 && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100">
                <Link href="/StudentBrowse">
                  <Compass className="w-4 h-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
          {/* Tabs + Search bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === tab.key
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${filter === tab.key ? tab.color : ""}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  {!loading && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      filter === tab.key ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"
                    }`}>
                      {tab.key === "all" ? courses.length : tab.key === "in-progress" ? counts["in-progress"] : counts.completed}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your courses..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </form>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-auto sm:ml-0">
              <button
                onClick={() => setView("list")}
                title="List view"
                className={`p-1.5 rounded-md transition-colors ${
                  view === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <ListBullets className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                title="Grid view"
                className={`p-1.5 rounded-md transition-colors ${
                  view === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <SquaresFour className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className={view === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"}>
              {[1, 2, 3].map((i) => <CourseSkeleton key={i} view={view} />)}
            </div>
          )}

          {/* List view */}
          {!loading && view === "list" && courses.length > 0 && (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseRowCard key={course.enrollmentId} course={course} />
              ))}
            </div>
          )}

          {/* Grid view */}
          {!loading && view === "grid" && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.map((course) => (
                <CourseGridCard key={course.enrollmentId} course={course} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                {filter === "completed" ? (
                  <Trophy className="w-9 h-9 text-amber-400" weight="fill" />
                ) : filter === "in-progress" ? (
                  <TrendUp className="w-9 h-9 text-blue-400" />
                ) : (
                  <GraduationCap className="w-9 h-9 text-blue-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filter === "completed"
                  ? "No completed courses yet"
                  : filter === "in-progress"
                  ? "No courses in progress"
                  : "You haven't enrolled in any courses"}
              </h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                {filter === "all"
                  ? "Browse our catalogue and start your learning journey today."
                  : "Keep going — your progress will show up here."}
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100">
                <Link href="/StudentBrowse">
                  <Compass className="w-4 h-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <LumiChat />
    </StudentLayout>
  );
}
