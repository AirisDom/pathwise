"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
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

function StudentBrowseContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<BrowseCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("popular");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCourses();
  }, [category, level, sort]);

  useEffect(() => {
    // Fetch enrolled course IDs for this student
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

  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case "BEGINNER": return "bg-green-50 text-green-700";
      case "INTERMEDIATE": return "bg-blue-50 text-blue-700";
      case "ADVANCED": return "bg-purple-50 text-purple-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <StudentLayout>
      <div className="px-4 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            Browse Courses
          </h1>
          <p className="text-gray-500">
            Discover courses from expert creators and level up your skills
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, topic, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
              Search
            </Button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Level */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Active filters */}
            {(category || level || search) && (
              <button
                onClick={() => {
                  setCategory("");
                  setLevel("");
                  setSearch("");
                  setTimeout(fetchCourses, 0);
                }}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1.5 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            )}

            {/* View Toggle */}
            <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-5">
            Showing <span className="font-semibold text-gray-700">{courses.length}</span> course{courses.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* GRID VIEW */}
        {/* ═══════════════════════════════════════ */}
        {!loading && view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
                >
                  <Link href={`/courses/${course.slug}`}>
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                          <BookOpen className="w-10 h-10 text-emerald-300" />
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getLevelColor(course.level)}`}>
                        {course.level.replace("_", " ")}
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mb-2">
                      {course.category}
                    </span>
                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    {course.subtitle && (
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{course.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">{course.creator.name}</p>

                    {/* Rating + Students */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
                      <div className="flex items-center gap-1">
                        {course.averageRating ? (
                          <>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-gray-700">{course.averageRating.toFixed(1)}</span>
                            <span>({course.reviewCount})</span>
                          </>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrollmentCount.toLocaleString()}
                      </div>
                    </div>

                    {/* Enroll button */}
                    {isEnrolled ? (
                      <Link href={`/courses/${course.slug}/learn`}>
                        <Button className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" size="sm">
                          <Zap className="w-3.5 h-3.5 mr-1.5" />
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingId === course.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                      >
                        {enrollingId === course.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                            Enroll Free
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* LIST VIEW */}
        {/* ═══════════════════════════════════════ */}
        {!loading && view === "list" && (
          <div className="space-y-3">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex"
                >
                  <Link href={`/courses/${course.slug}`} className="shrink-0">
                    <div className="w-48 h-full bg-gray-100 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                          <BookOpen className="w-8 h-8 text-emerald-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {course.category}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                          {course.level.replace("_", " ")}
                        </span>
                      </div>
                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="font-semibold text-gray-900 mb-0.5 group-hover:text-emerald-700 transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      {course.subtitle && (
                        <p className="text-sm text-gray-500 line-clamp-1">{course.subtitle}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{course.creator.name}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {course.averageRating ? (
                            <>
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-medium text-gray-700">{course.averageRating.toFixed(1)}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No ratings</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {course.enrollmentCount.toLocaleString()} students
                        </div>
                        <span>{course.totalLessons} lessons</span>
                      </div>

                      {isEnrolled ? (
                        <Link href={`/courses/${course.slug}/learn`}>
                          <Button size="sm" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                            Continue
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingId === course.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {enrollingId === course.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Enroll Free"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No results */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Try adjusting your filters or search terms to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default function StudentBrowse() {
  return (
    <Suspense
      fallback={
        <StudentLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        </StudentLayout>
      }
    >
      <StudentBrowseContent />
    </Suspense>
  );
}
