"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SiteFooter from "@/components/layout/SiteFooter";
import PublicNav from "@/components/layout/PublicNav";
import {
  MagnifyingGlass,
  Star,
  Users,
  BookOpen,
  CaretDown,
  Faders,
  CircleNotch,
  GraduationCap,
  X,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Course {
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
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
];

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
  ALL_LEVELS: "bg-blue-100 text-blue-700",
};

function levelLabel(level: string) {
  return level.charAt(0) + level.slice(1).toLowerCase().replace("_", " ");
}


// ═══════════════════════════════════════
// Star Rating
// ═══════════════════════════════════════

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" weight="fill" />
      <span className="text-xs font-semibold text-amber-600">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </span>
  );
}

// ═══════════════════════════════════════
// Course Card
// ═══════════════════════════════════════

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (id: string) => void }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-linear-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-blue-300" weight="duotone" />
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 text-blue-700 shadow-sm">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors mb-1">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">{course.subtitle}</p>
        )}

        <p className="text-xs text-gray-500 mb-3">
          by{" "}
          <span className="font-medium text-gray-700">
            {course.creator.name ?? "Anonymous"}
          </span>
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto mb-3 flex-wrap">
          {course.averageRating ? (
            <StarRating rating={course.averageRating} count={course.reviewCount} />
          ) : null}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3 h-3" weight="regular" />
            {course.enrollmentCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <BookOpen className="w-3 h-3" weight="regular" />
            {course.totalLessons} lessons
          </span>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              LEVEL_COLORS[course.level] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {levelLabel(course.level)}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onEnroll(course.id);
          }}
          className="w-full py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Enroll Free
        </button>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════
// Main Page
// ═══════════════════════════════════════

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("popular");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      if (level) params.set("level", level);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/student/browse?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data ?? json;
      setCourses(data.courses ?? []);
      if (data.categories?.length) {
        setCategories(data.categories);
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, level, sort]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleEnroll = async (courseId: string) => {
    if (status !== "authenticated") {
      const course = courses.find((c) => c.id === courseId);
      const callbackUrl = course ? `/courses/${course.slug}` : `/courses`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    try {
      const res = await fetch(`/api/student/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        const course = courses.find((c) => c.id === courseId);
        if (course) router.push(`/courses/${course.slug}/learn`);
      } else {
        alert(data.error?.message || "Could not enroll");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />

      {/* ── Hero banner ── */}
      <section className="pt-16 bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Expand Your Skills
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Explore hundreds of courses across tech, business, design, and more. All completely free.
          </p>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto">
            <div className="flex flex-1 bg-white rounded-l-xl overflow-hidden">
              <MagnifyingGlass className="w-5 h-5 text-gray-400 ml-4 self-center shrink-0" weight="regular" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="MagnifyingGlass for anything…"
                className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-sm rounded-r-xl transition-colors"
            >
              MagnifyingGlass
            </button>
          </form>
        </div>
      </section>

      {/* ── Category pills ── */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setCategory("")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  category === ""
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === category ? "" : cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    category === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-36">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Faders className="w-4 h-4" weight="regular" />
                Filters
              </h3>

              {/* Level */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Level
                </p>
                <div className="space-y-1.5">
                  {LEVELS.map((l) => (
                    <label key={l.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={l.value}
                        checked={level === l.value}
                        onChange={() => setLevel(l.value)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{l.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category (desktop sidebar redundancy for convenience) */}
              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Category
                  </p>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={category === ""}
                        onChange={() => setCategory("")}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={category === cat}
                          onChange={() => setCategory(cat)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Course grid */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {loading ? (
                    "Loading courses…"
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900">{courses.length}</span>{" "}
                      {courses.length === 1 ? "course" : "courses"} found
                      {search && (
                        <>
                          {" "}for{" "}
                          <span className="font-medium text-blue-600">"{search}"</span>
                          <button
                            onClick={() => { setSearch(""); setSearchInput(""); }}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3.5 h-3.5 inline" weight="regular" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" weight="regular" />
                </div>
              </div>
            </div>

            {/* Mobile level filter */}
            <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-1">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    level === l.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <CircleNotch className="w-8 h-8 animate-spin mb-3" weight="regular" />
                <p className="text-sm">Loading courses…</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <GraduationCap className="w-12 h-12 text-gray-300 mb-4" weight="duotone" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Try adjusting your filters or search for something different.
                </p>
                <button
                  onClick={() => { setSearch(""); setSearchInput(""); setCategory(""); setLevel(""); }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
