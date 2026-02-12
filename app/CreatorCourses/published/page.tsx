"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import CourseCard, { type CourseCardData } from "@/components/creator/CourseCard";
import { Loader2, Globe, Plus } from "lucide-react";
import Link from "next/link";

export default function PublishedPage() {
  const { status } = useSession();
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchPublished();
  }, [status]);

  async function fetchPublished() {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/courses?status=PUBLISHED&limit=50");
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data?.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch published courses:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CreatorLayout activeItem="/CreatorCourses/published">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Published Courses</h1>
            <p className="text-gray-500 mt-1">
              Courses currently live and available to students
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
            <span className="ml-3 text-gray-500">Loading published courses…</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No published courses</h3>
            <p className="text-gray-500 mb-6">
              Once you publish a course, it will appear here and be visible to students.
            </p>
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
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
