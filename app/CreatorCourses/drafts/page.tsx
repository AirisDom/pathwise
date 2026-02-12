"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import CourseCard, { type CourseCardData } from "@/components/creator/CourseCard";
import { Loader2, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function DraftsPage() {
  const { status } = useSession();
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchDrafts();
  }, [status]);

  async function fetchDrafts() {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/courses?status=DRAFT&limit=50");
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data?.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  return (
    <CreatorLayout activeItem="/CreatorCourses/drafts">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drafts</h1>
            <p className="text-gray-500 mt-1">
              Unfinished courses saved automatically while editing
            </p>
          </div>
          <Link
            href="/CreatorCourses/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Course
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500">Loading drafts…</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No drafts</h3>
            <p className="text-gray-500 mb-6">
              When you start creating a course and leave, it will be saved here automatically.
            </p>
            <Link
              href="/CreatorCourses/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Start a New Course
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
