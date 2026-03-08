"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import LumiChat from "@/components/student/LumiChat";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Filter,
  Grid3x3,
  LayoutList,
  Loader2,
  Search,
  Star,
  Users,
  X,
  Sparkles,
  GraduationCap,
  Zap,
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";

interface BrowseCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail: string | null;
  category: string;
  level: string;
  creator: { id: string; name: string | null; image: string | null };
  enrollmentCount: number;
  averageRating: number | null;
  reviewCount: number;
  totalLessons: number;
  tags: string[];
  publishedAt?: string | null;
}

const LEVELS = [
  { value: "", label: "All Levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All Levels Tag" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
];

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

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-amber-600">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count} reviews)</span>
    </div>
  );
}

function CourseRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-44 animate-pulse">
      <div className="w-64 shrink-0 bg-gray-200" />
      <div className="flex-1 p-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-6 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-4/5 bg-gray-100 rounded" />
        <div className="mt-auto flex gap-6">
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

function HorizontalCourseCard({
  course,
  isEnrolled,
  enrollingId,
  onEnroll,
}: {
  course: BrowseCourse;
  isEnrolled: boolean;
  enrollingId: string | null;
  onEnroll: (id: string) => void;
}) {
  const levelCfg = getLevelConfig(course.level);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-[0_8px_40px_-8px_rgba(37,99,235,0.15)] transition-all duration-300 flex">
      {/* Thumbnail */}
      <Link href={`/courses/${course.slug}`} className="shrink-0 relative w-56 lg:w-64 xl:w-72 overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-medium">No Preview</span>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 transition-all duration-300 flex items-center justify-center scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
            <Play className="w-5 h-5 text-blue-600 ml-0.5" />
          </div>
        </div>
        {/* Level badge on thumbnail */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${levelCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${levelCfg.dot}`} />
          {levelCfg.label}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-5 lg:p-6 flex flex-col min-w-0">
        {/* Top row: category + enrolled badge */}
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              {course.category}
            </span>
            {course.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          {isEnrolled && (
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Enrolled
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/courses/${course.slug}`}>
          <h3 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors mb-1 leading-tight">
            {course.title}
          </h3>
        </Link>

        {/* Subtitle / description */}
        {course.subtitle && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {course.subtitle}
          </p>
        )}

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          {course.creator.image ? (
            <img src={course.creator.image} alt={course.creator.name ?? ""} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">
                {course.creator.name?.charAt(0) ?? "?"}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            By <span className="font-medium text-gray-700">{course.creator.name}</span>
          </span>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
          {course.averageRating ? (
            <StarRating rating={course.averageRating} count={course.reviewCount} />
          ) : (
            <span className="flex items-center gap-1 text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              New course
            </span>
          )}

          <div className="w-px h-3.5 bg-gray-200" />

          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span><span className="font-semibold text-gray-700">{course.enrollmentCount.toLocaleString()}</span> students</span>
          </div>

          <div className="w-px h-3.5 bg-gray-200" />

          <div className="flex items-center gap-1">
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span><span className="font-semibold text-gray-700">{course.totalLessons}</span> lessons</span>
          </div>
        </div>

        {/* Bottom: action */}
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Certificate on completion</span>
          </div>

          {isEnrolled ? (
            <Link href={`/courses/${course.slug}/learn`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 px-5" size="sm">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Continue Learning
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => onEnroll(course.id)}
              disabled={enrollingId === course.id}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 px-5"
              size="sm"
            >
              {enrollingId === course.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                  Enrol Free
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Right accent bar */}
      <div className="w-1 shrink-0 bg-linear-to-b from-blue-200 via-indigo-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

function GridCourseCard({
  course,
  isEnrolled,
  enrollingId,
  onEnroll,
}: {
  course: BrowseCourse;
  isEnrolled: boolean;
  enrollingId: string | null;
  onEnroll: (id: string) => void;
}) {
  const levelCfg = getLevelConfig(course.level);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-[0_8px_30px_-8px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col">
      <Link href={`/courses/${course.slug}`} className="relative block aspect-video overflow-hidden bg-gray-100">
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
        <div className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm ${levelCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${levelCfg.dot}`} />
          {levelCfg.label}
        </div>
        {isEnrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <CheckCircle2 className="w-3 h-3" />
            Enrolled
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full w-fit mb-2">
          {course.category}
        </span>
        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors leading-snug">
            {course.title}
          </h3>
        </Link>
        {course.subtitle && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{course.subtitle}</p>
        )}

        <div className="flex items-center gap-1.5 mb-3">
          {course.creator.image ? (
            <img src={course.creator.image} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">{course.creator.name?.charAt(0)}</span>
            </div>
          )}
          <span className="text-xs text-gray-500">{course.creator.name}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
          <div className="flex items-center gap-1">
            {course.averageRating ? (
              <>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-medium text-amber-600">{course.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({course.reviewCount})</span>
              </>
            ) : (
              <span className="text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> New
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-gray-600">{course.enrollmentCount.toLocaleString()}</span>
          </div>
        </div>

        {isEnrolled ? (
          <Link href={`/courses/${course.slug}/learn`}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Continue Learning
            </Button>
          </Link>
        ) : (
          <Button
            onClick={() => onEnroll(course.id)}
            disabled={enrollingId === course.id}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {enrollingId === course.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                Enrol Free
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function StudentBrowseContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<BrowseCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("popular");
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetchCourses();
  }, [category, level, sort]);

  useEffect(() => {
    async function fetchEnrolled() {
      try {
        const res = await fetch("/api/student/courses?filter=all");
        if (res.ok) {
          const json = await res.json();
          const ids = new Set<string>(json.data.courses.map((c: { courseId: string }) => c.courseId));
          setEnrolledIds(ids);
        }
      } catch {
        // ignore
      }
    }
    if (status === "authenticated") fetchEnrolled();
  }, [status]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      if (level) params.set("level", level);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/student/browse?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data.courses);
        setCategories(json.data.categories);
      }
    } catch (err) {
      console.error("Failed to browse courses:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (courseId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    setEnrollingId(courseId);
    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setEnrolledIds((prev) => new Set([...prev, courseId]));
      }
    } catch (err) {
      console.error("Failed to enroll:", err);
    } finally {
      setEnrollingId(null);
    }
  };

  const clearFilters = () => {
    setCategory("");
    setLevel("");
    setSearch("");
    setTimeout(fetchCourses, 0);
  };

  const hasActiveFilters = !!(category || level || search);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50/50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                  Browse Courses
                </h1>
                <p className="text-gray-500 text-sm">
                  Discover expert-led courses and level up your skills — all free
                </p>
              </div>
              {!loading && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700">{courses.length}</span>
                  <span className="text-sm text-blue-500">courses available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
          {/* Search + Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses by title, topic, or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl shadow-sm shadow-blue-200">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <Filter className="w-3.5 h-3.5" />
                Filter by:
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              )}

              {/* View toggle */}
              <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView("list")}
                  title="List view"
                  className={`p-1.5 rounded-md transition-colors ${
                    view === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  title="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${
                    view === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <CourseRowSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ═══════════ LIST VIEW (default) ═══════════ */}
          {!loading && view === "list" && courses.length > 0 && (
            <div className="space-y-4">
              {courses.map((course) => (
                <HorizontalCourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledIds.has(course.id)}
                  enrollingId={enrollingId}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          )}

          {/* ═══════════ GRID VIEW ═══════════ */}
          {!loading && view === "grid" && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((course) => (
                <GridCourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledIds.has(course.id)}
                  enrollingId={enrollingId}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Search className="w-9 h-9 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                Try adjusting your filters or search terms to discover what you&apos;re looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <LumiChat />
    </StudentLayout>
  );
}

export default function StudentBrowse() {
  return (
    <Suspense
      fallback={
        <StudentLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </StudentLayout>
      }
    >
      <StudentBrowseContent />
    </Suspense>
  );
}
