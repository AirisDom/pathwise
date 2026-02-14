"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Loader2,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";

interface ProgressData {
  stats: {
    totalEnrolled: number;
    inProgress: number;
    completed: number;
    totalLessonsCompleted: number;
    totalHoursLearned: number;
    currentStreak: number;
  };
  recentCourses: {
    enrollmentId: string;
    courseId: string;
    title: string;
    category: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    lastAccessedAt: string | null;
  }[];
}

export default function StudentProgress() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") fetchProgress();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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

  const completionRate =
    stats.totalEnrolled > 0
      ? Math.round((stats.completed / stats.totalEnrolled) * 100)
      : 0;

  // Mock activity data for the heatmap (7 columns × 7 rows = 49 squares ≈ 7 weeks)
  const activityDays = Array.from({ length: 49 }, (_, i) => ({
    day: i,
    count: Math.floor(Math.random() * 5), // Placeholder — would come from real data
  }));

  return (
    <StudentLayout>
      <div className="px-4 lg:px-8 py-6 lg:py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Your Progress
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Track your learning milestones and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Courses", value: stats.totalEnrolled, icon: BookOpen, color: "blue" },
            { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "amber" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "emerald" },
            { label: "Lessons Done", value: stats.totalLessonsCompleted, icon: Target, color: "purple" },
            { label: "Hours Learned", value: stats.totalHoursLearned, icon: Clock, color: "cyan" },
            { label: "Day Streak", value: stats.currentStreak, icon: Flame, color: "orange" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-${item.color}-50`}>
                <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion Rate Ring */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Completion Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="#f3f4f6" strokeWidth="8" fill="none"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="#10b981" strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${completionRate * 2.64} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-gray-500">Complete</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed ({stats.completed})
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                Remaining ({stats.inProgress})
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Learning Activity</h3>
              <span className="text-xs text-gray-500">Last 7 weeks</span>
            </div>

            <div className="flex gap-1.5 justify-center flex-wrap">
              {activityDays.map((day, i) => {
                const intensity =
                  day.count === 0
                    ? "bg-gray-100"
                    : day.count === 1
                    ? "bg-emerald-200"
                    : day.count === 2
                    ? "bg-emerald-300"
                    : day.count === 3
                    ? "bg-emerald-400"
                    : "bg-emerald-600";

                return (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-sm ${intensity} transition-colors`}
                    title={`${day.count} activities`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-4">
              <span className="text-[10px] text-gray-400">Less</span>
              <div className="w-3 h-3 rounded-sm bg-gray-100" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600" />
              <span className="text-[10px] text-gray-400">More</span>
            </div>
          </div>
        </div>

        {/* Course Progress List */}
        {data?.recentCourses && data.recentCourses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Course Progress</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {data.recentCourses.map((course) => (
                <div key={course.enrollmentId} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {course.completedLessons}/{course.totalLessons} lessons •{" "}
                      {course.category}
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">{Math.round(course.progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "First Steps", desc: "Enroll in your first course", icon: Zap, earned: stats.totalEnrolled > 0 },
              { name: "Dedicated", desc: "Complete 5 lessons", icon: Target, earned: stats.totalLessonsCompleted >= 5 },
              { name: "Achiever", desc: "Complete your first course", icon: Trophy, earned: stats.completed > 0 },
              { name: "Scholar", desc: "Enroll in 3 courses", icon: GraduationCap, earned: stats.totalEnrolled >= 3 },
              { name: "Streak Master", desc: "7-day learning streak", icon: Flame, earned: stats.currentStreak >= 7 },
              { name: "Reviewer", desc: "Leave your first review", icon: Star, earned: false },
            ].map((badge) => (
              <div
                key={badge.name}
                className={`text-center p-4 rounded-xl border-2 transition-all ${
                  badge.earned
                    ? "border-amber-200 bg-amber-50"
                    : "border-gray-100 bg-gray-50 opacity-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    badge.earned ? "bg-amber-100" : "bg-gray-200"
                  }`}
                >
                  <badge.icon
                    className={`w-6 h-6 ${badge.earned ? "text-amber-600" : "text-gray-400"}`}
                  />
                </div>
                <p className={`text-xs font-semibold ${badge.earned ? "text-gray-900" : "text-gray-500"}`}>
                  {badge.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
