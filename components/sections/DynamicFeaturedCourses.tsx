"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Users,
  BookOpen,
  PlayCircle,
  ArrowRight,
  Loader2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface FeaturedCourse {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  thumbnail: string | null;
  category: string;
  level: string;
  enrollmentCount: number;
  averageRating: number | null;
  reviewCount: number;
  creator: { id: string; name: string | null; image: string | null };
  _count: { sections: number; enrollments: number };
}

export default function DynamicFeaturedCourses() {
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses/featured")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCourses(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
                Featured
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Courses
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl">
              Start learning from our most popular courses, chosen by thousands
              of students.
            </p>
          </div>
          <Link
            href="/StudentBrowse"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50">
                    <PlayCircle className="w-10 h-10 text-emerald-300" />
                  </div>
                )}
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1.5">
                  {course.title}
                </h3>

                <p className="text-xs text-gray-500 mb-3">
                  {course.creator.name}
                </p>

                {/* Rating & Students */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {course.averageRating ? (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-gray-700">
                          {Number(course.averageRating).toFixed(1)}
                        </span>
                        <span>({course.reviewCount})</span>
                      </>
                    ) : (
                      <span className="text-gray-400">New</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.enrollmentCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Level */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {course.level.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/StudentBrowse"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
