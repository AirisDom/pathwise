"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  Loader2,
  Star,
  TrendingUp,
  Users,
  Eye,
  Layers,
  Award,
} from "lucide-react";

interface CourseAnalytics {
  id: string;
  title: string;
  slug: string;
  status: string;
  enrollmentCount: number;
  averageRating: number | null;
  reviewCount: number;
  viewCount: number;
  completionRate: number | null;
  _count: { sections: number; enrollments: number; reviews: number };
  sections: { _count: { lessons: number } }[];
}

interface OverallStats {
  totalEnrollments: number;
  totalCourses: number;
  publishedCourses: number;
  totalViews: number;
  totalReviews: number;
  avgRating: number | null;
  totalLessons: number;
}

export default function CreatorAnalyticsPage() {
  const { status } = useSession();
  const [courses, setCourses] = useState<CourseAnalytics[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchAnalytics();
  }, [status]);

  async function fetchAnalytics() {
    try {
      const res = await fetch("/api/creator/courses?limit=100");
      if (res.ok) {
        const json = await res.json();
        const courseList: CourseAnalytics[] = json.data?.data ?? json.data ?? [];
        setCourses(courseList);

        let totalEnrollments = 0;
        let totalViews = 0;
        let totalReviews = 0;
        let ratingSum = 0;
        let ratingCount = 0;
        let totalLessons = 0;

        courseList.forEach((c) => {
          totalEnrollments += c.enrollmentCount;
          totalViews += c.viewCount;
          totalReviews += c.reviewCount;
          if (c.averageRating) {
            ratingSum += Number(c.averageRating);
            ratingCount++;
          }
          c.sections.forEach((s) => {
            totalLessons += s._count.lessons;
          });
        });

        setOverall({
          totalEnrollments,
          totalCourses: courseList.length,
          publishedCourses: courseList.filter((c) => c.status === "PUBLISHED").length,
          totalViews,
          totalReviews,
          avgRating: ratingCount > 0 ? ratingSum / ratingCount : null,
          totalLessons,
        });
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

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
                <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
                <p className="text-xs text-gray-500">
                  Performance overview for all your courses
                </p>
              </div>
            </div>
            <Link
              href="/creator/courses"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Manage Courses →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats Grid */}
        {overall && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Students",
                value: overall.totalEnrollments.toLocaleString(),
                icon: Users,
                color: "text-blue-600 bg-blue-50",
              },
              {
                label: "Published Courses",
                value: overall.publishedCourses.toString(),
                icon: BookOpen,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Total Views",
                value: overall.totalViews.toLocaleString(),
                icon: Eye,
                color: "text-purple-600 bg-purple-50",
              },
              {
                label: "Avg Rating",
                value: overall.avgRating ? overall.avgRating.toFixed(1) : "—",
                icon: Star,
                color: "text-amber-600 bg-amber-50",
              },
              {
                label: "Total Reviews",
                value: overall.totalReviews.toLocaleString(),
                icon: Award,
                color: "text-pink-600 bg-pink-50",
              },
              {
                label: "Total Lessons",
                value: overall.totalLessons.toLocaleString(),
                icon: Layers,
                color: "text-indigo-600 bg-indigo-50",
              },
              {
                label: "All Courses",
                value: overall.totalCourses.toString(),
                icon: GraduationCap,
                color: "text-teal-600 bg-teal-50",
              },
              {
                label: "Enrollments",
                value: overall.totalEnrollments.toLocaleString(),
                icon: TrendingUp,
                color: "text-orange-600 bg-orange-50",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Per-Course Analytics Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Course Performance
            </h2>
          </div>

          {courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 font-semibold text-gray-600">Course</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Students</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Views</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Rating</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Reviews</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Lessons</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((course) => {
                    const totalLessons = course.sections.reduce(
                      (sum, s) => sum + s._count.lessons,
                      0
                    );
                    return (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              course.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700"
                                : course.status === "DRAFT"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-gray-700">
                          {course.enrollmentCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-500">
                          {course.viewCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {course.averageRating ? (
                            <div className="flex items-center justify-end gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-medium text-gray-700">
                                {Number(course.averageRating).toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-500">{course.reviewCount}</td>
                        <td className="px-4 py-4 text-right text-gray-500">{totalLessons}</td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            href={`/creator/courses/${course.id}/edit`}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No courses yet.</p>
              <Link
                href="/CreatorCourses/create"
                className="text-sm text-emerald-600 hover:underline mt-2 inline-block"
              >
                Create your first course
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
