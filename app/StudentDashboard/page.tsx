"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle,
  CaretRight,
  Clock,
  Compass,
  Flame,
  GraduationCap,
  CircleNotch,
  PlayCircle,
  Star,
  Target,
  Trophy,
  TrendUp,
  Users,
  Lightning,
  ArrowRight,
  ChartBar,
  Sparkle,
} from "@phosphor-icons/react";

interface RecentCourse {
  enrollmentId: string;
  courseId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  category: string;
  level: string;
  creator: { id: string; name: string | null; image: string | null };
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessedAt: string | null;
}

interface RecommendedCourse {
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
}

interface DashboardStats {
  totalEnrolled: number;
  inProgress: number;
  completed: number;
  totalLessonsCompleted: number;
  totalHoursLearned: number;
  currentStreak: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentCourses: RecentCourse[];
  recommended: RecommendedCourse[];
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name ?? "Student";
  const firstName = userName.split(" ")[0];

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <CircleNotch className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const stats = data?.stats ?? {
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
    totalLessonsCompleted: 0,
    totalHoursLearned: 0,
    currentStreak: 0,
  };

  return (
    <StudentLayout>
      <div className="px-4 lg:px-8 py-6 lg:py-8 space-y-8">
        {/* ═══════════════════════════════════════ */}
        {/* HERO GREETING */}
        {/* ═══════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 lg:p-8 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                  {greeting}, {firstName}! 👋
                </h1>
                <p className="text-emerald-100 text-sm lg:text-base">
                  {stats.inProgress > 0
                    ? `You have ${stats.inProgress} course${stats.inProgress > 1 ? "s" : ""} in progress. Keep up the momentum!`
                    : "Ready to start learning something new today?"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  asChild
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg"
                >
                  <Link href={stats.inProgress > 0 ? "/StudentCourses" : "/StudentBrowse"}>
                    {stats.inProgress > 0 ? (
                      <>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4 mr-2" />
                        Browse Courses
                      </>
                    )}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mini Stats Row */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Enrolled", value: stats.totalEnrolled, icon: BookOpen },
                { label: "In Progress", value: stats.inProgress, icon: TrendUp },
                { label: "Completed", value: stats.completed, icon: CheckCircle },
                { label: "Lessons Done", value: stats.totalLessonsCompleted, icon: Target },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-emerald-200" />
                    <span className="text-xs text-emerald-200">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* CONTINUE LEARNING */}
        {/* ═══════════════════════════════════════ */}
        {data?.recentCourses && data.recentCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                <p className="text-sm text-gray-500 mt-0.5">Pick up where you left off</p>
              </div>
              <Link
                href="/StudentCourses"
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {data.recentCourses.map((course) => (
                <Link
                  key={course.enrollmentId}
                  href={`/courses/${course.slug}/learn`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
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
                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <PlayCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {course.category}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {course.level.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {course.creator.name}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                        <span className="font-semibold text-emerald-600">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* RECOMMENDED FOR YOU */}
        {/* ═══════════════════════════════════════ */}
        {data?.recommended && data.recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-amber-500" />
                  Recommended for You
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Courses you might enjoy</p>
              </div>
              <Link
                href="/StudentBrowse"
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.recommended.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}/learn`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                >
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
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      {course.level.replace("_", " ")}
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mt-2 mb-1 group-hover:text-emerald-700 transition-colors">
                      {course.title}
                    </h3>
                    {course.subtitle && (
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                        {course.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">{course.creator.name}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {course.averageRating ? (
                          <>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-gray-700">
                              {course.averageRating.toFixed(1)}
                            </span>
                            <span>({course.reviewCount})</span>
                          </>
                        ) : (
                          <span className="text-gray-400">New course</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{course.enrollmentCount.toLocaleString()} students</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* EMPTY STATE */}
        {/* ═══════════════════════════════════════ */}
        {!loading && stats.totalEnrolled === 0 && (!data?.recommended || data.recommended.length === 0) && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your Learning Journey
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Browse our catalog of courses and find something that excites you.
              Your learning dashboard will come alive once you enroll!
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/StudentBrowse">
                <Compass className="w-4 h-4 mr-2" />
                Explore Courses
              </Link>
            </Button>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* QUICK STATS CARDS */}
        {/* ═══════════════════════════════════════ */}
        {stats.totalEnrolled > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Your Stats</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total Courses</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrolled}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Lessons Done</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLessonsCompleted}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Day Streak</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.currentStreak}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </StudentLayout>
  );
}
