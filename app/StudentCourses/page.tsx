"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  Faders,
  GraduationCap,
  CircleNotch,
  PlayCircle,
  MagnifyingGlass,
  Trophy,
  TrendUp,
  X,
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

export default function StudentCourses() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

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

  const filterTabs: { key: FilterType; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All Courses", icon: BookOpen },
    { key: "in-progress", label: "In Progress", icon: TrendUp },
    { key: "completed", label: "Completed", icon: CheckCircle },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <StudentLayout>
      <div className="px-4 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Track your learning journey
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/StudentBrowse">
              <Compass className="w-4 h-4 mr-2" />
              Browse More
            </Link>
          </Button>
        </div>

        {/* Faders Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* MagnifyingGlass */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="MagnifyingGlass your courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        {/* Course Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                key={course.enrollmentId}
                href={`/courses/${course.slug}/learn`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
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

                  {/* Completed Badge */}
                  {course.isCompleted && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Trophy className="w-3 h-3" />
                      Completed
                    </div>
                  )}

                  {/* Progress bar at bottom */}
                  {!course.isCompleted && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-7 h-7 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {course.level.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{course.creator.name}</p>

                  <div className="mt-auto">
                    {course.isCompleted ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed {formatDate(course.completedAt)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {course.totalLessons} lessons
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span className="font-semibold text-emerald-600">
                            {Math.round(course.progress)}%
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        {course.lastAccessedAt && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last accessed {formatDate(course.lastAccessedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              {filter === "completed" ? (
                <Trophy className="w-10 h-10 text-emerald-400" />
              ) : filter === "in-progress" ? (
                <TrendUp className="w-10 h-10 text-emerald-400" />
              ) : (
                <GraduationCap className="w-10 h-10 text-emerald-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "completed"
                ? "No completed courses yet"
                : filter === "in-progress"
                ? "No courses in progress"
                : "No courses enrolled"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              {filter === "all"
                ? "Start your learning journey by enrolling in a course."
                : "Keep learning and your courses will appear here."}
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/StudentBrowse">
                <Compass className="w-4 h-4 mr-2" />
                Browse Courses
              </Link>
            </Button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
