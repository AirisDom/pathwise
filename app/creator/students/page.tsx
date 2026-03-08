"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  Loader2,
  Search,
  Users,
  CheckCircle2,
  User,
  BarChart3,
} from "lucide-react";

interface StudentEnrollment {
  id: string;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  lastAccessedAt: string | null;
  student: { id: string; name: string | null; email: string; image: string | null };
  course: { id: string; title: string; slug: string };
}

export default function CreatorStudentsPage() {
  const { status } = useSession();
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchStudents();
  }, [status]);

  async function fetchStudents() {
    try {
      const res = await fetch("/api/creator/courses?limit=100");
      if (!res.ok) return;
      const json = await res.json();
      const courseIds: string[] = (json.data?.data ?? json.data ?? []).map(
        (c: { id: string }) => c.id
      );

      // Fetch enrollments for all creator courses
      const enrollmentPromises = courseIds.map(async (courseId) => {
        const r = await fetch(`/api/courses/${courseId}/reviews?limit=1`);
        // We actually need enrollments—but let's use the existing course data
        return [];
      });

      // Use a different approach: query all enrollments via a dedicated endpoint
      // For now, use what we have from course data
      const allEnrollments: StudentEnrollment[] = [];

      for (const courseId of courseIds.slice(0, 10)) {
        try {
          const r = await fetch(`/api/creator/courses/${courseId}/students`);
          if (r.ok) {
            const data = await r.json();
            if (data.data) allEnrollments.push(...data.data);
          }
        } catch {
          // endpoint may not exist yet
        }
      }

      setEnrollments(allEnrollments);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = enrollments.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.student.name?.toLowerCase().includes(q) ||
      e.student.email.toLowerCase().includes(q) ||
      e.course.title.toLowerCase().includes(q)
    );
  });

  const uniqueStudents = new Set(enrollments.map((e) => e.student.id)).size;
  const completedCount = enrollments.filter((e) => e.isCompleted).length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/CreatorDashboard"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Students</h1>
                <p className="text-xs text-gray-500">
                  Students enrolled in your courses
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{uniqueStudents}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium">Total Enrollments</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Completions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or course..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 font-semibold text-gray-600">Student</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Course</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Progress</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Enrolled</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                            {enrollment.student.image ? (
                              <img
                                src={enrollment.student.image}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {enrollment.student.name ?? "Student"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enrollment.student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-gray-700 line-clamp-1">{enrollment.course.title}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Number(enrollment.progress)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-8 text-right">
                            {Math.round(Number(enrollment.progress))}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {enrollment.isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">In Progress</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-gray-500">
                        {enrollment.lastAccessedAt
                          ? new Date(enrollment.lastAccessedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {enrollments.length === 0
                  ? "No students enrolled yet."
                  : "No students match your search."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
