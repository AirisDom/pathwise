"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  Edit3,
  Eye,
  Users,
  Star,
  Layers,
  PlayCircle,
  Search,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  level: string;
  thumbnail: string | null;
  enrollmentCount: number;
  averageRating: number | null;
  reviewCount: number;
  viewCount: number;
  publishedAt: string | null;
  updatedAt: string;
  _count: {
    enrollments: number;
    reviews: number;
    sections: number;
  };
  sections: { _count: { lessons: number } }[];
}

export default function CreatorCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [statusFilter, search]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("limit", "50");

      const res = await fetch(`/api/creator/courses?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data?.items ?? json.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalLessons = (course: Course) =>
    course.sections?.reduce((s, sec) => s + sec._count.lessons, 0) ?? 0;

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/creator/dashboard"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage your course content and track performance
                </p>
              </div>
            </div>
            <Link
              href="/creator/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Course
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {["", "DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No courses yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first course and start sharing your knowledge!
            </p>
            <Link
              href="/creator/courses/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[course.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {course.status}
                        </span>
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>
                          {course._count.sections} sections, {totalLessons(course)} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{course._count.enrollments} students</span>
                      </div>
                      {course.averageRating && (
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>
                            {Number(course.averageRating).toFixed(1)} ({course._count.reviews})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{course.viewCount} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/creator/courses/${course.id}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Content
                    </Link>
                    <Link
                      href={`/courses/${course.slug}/learn`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Preview
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
