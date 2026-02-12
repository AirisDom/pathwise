"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import CourseCard, { type CourseCardData } from "@/components/creator/CourseCard";
import { Loader2, Search, Plus } from "lucide-react";
import Link from "next/link";

export default function AllCoursesPage() {
  const { status } = useSession();
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchCourses();
  }, [status]);

  async function fetchCourses(query?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (query) params.set("search", query);
      const res = await fetch(`/api/creator/courses?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data?.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCourses(search);
  }

  return (
    <CreatorLayout activeItem="/CreatorCourses/all">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
            <p className="text-gray-500 mt-1">Manage all your courses in one place</p>
          </div>
          <Link
            href="/CreatorCourses/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Course
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500">Loading courses…</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses yet</h3>
            <p className="text-gray-500 mb-6">Create your first course to get started.</p>
            <Link
              href="/CreatorCourses/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
