"use client";

import { useState, useEffect } from "react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import {
  MagnifyingGlass,
  Users,
  CaretDown,
  CaretUp,
  CircleNotch,
  UserCircle,
  BookOpen,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";

interface CourseProgress {
  id: string;
  title: string;
  thumbnail: string | null;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  lastAccessedAt: string | null;
}

interface Student {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  joinedAt: string;
  totalCourses: number;
  avgProgress: number;
  lastActive: string | null;
  courses: CourseProgress[];
}

function timeAgo(date: string | null) {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function CreatorStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [courseFilter]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (courseFilter) params.set("courseId", courseFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/creator/students?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        if (data.courses) setCourses(data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search
    ? students.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
      )
    : students;

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500 mt-1">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""} enrolled in your courses
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-48"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500">Loading students...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {search || courseFilter
                ? "Try adjusting your search or filters."
                : "Students will appear here once they enroll in your courses."}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Student</div>
              <div className="col-span-2">Courses</div>
              <div className="col-span-3">Avg. Progress</div>
              <div className="col-span-2">Last Active</div>
              <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            {filtered.map((student) => (
              <div key={student.id} className="border-b border-gray-100 last:border-b-0">
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedStudent(expandedStudent === student.id ? null : student.id)
                  }
                >
                  {/* Student info */}
                  <div className="col-span-4 flex items-center gap-3">
                    {student.image ? (
                      <img
                        src={student.image}
                        alt={student.name || ""}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.name || "Unnamed Student"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>

                  {/* Courses count */}
                  <div className="col-span-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {student.totalCourses} course{student.totalCourses !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            student.avgProgress === 100
                              ? "bg-emerald-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${student.avgProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-10 text-right">
                        {student.avgProgress}%
                      </span>
                    </div>
                  </div>

                  {/* Last active */}
                  <div className="col-span-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{timeAgo(student.lastActive)}</span>
                  </div>

                  {/* Expand */}
                  <div className="col-span-1 flex justify-end">
                    {expandedStudent === student.id ? (
                      <CaretUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <CaretDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded course details */}
                {expandedStudent === student.id && (
                  <div className="px-6 pb-4 bg-gray-50/50">
                    <div className="ml-13 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Enrolled Courses
                      </p>
                      {student.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-100"
                        >
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-12 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-gray-200 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  course.isCompleted ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8 text-right">
                              {Math.round(course.progress)}%
                            </span>
                            {course.isCompleted && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
