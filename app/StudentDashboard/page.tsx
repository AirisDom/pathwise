"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StudentLayout from "@/components/student/StudentLayout";
import LumiChat from "@/components/student/LumiChat";
import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/line-charts-9";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import {
  BookOpen, CheckCircle, CircleNotch, PlayCircle, Star, Users,
  ArrowRight, Compass, GraduationCap, Target, Clock, TrendUp,
  Trophy, Sparkle, CaretRight,
} from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────

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

interface CompletedCourse {
  enrollmentId: string;
  courseId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  category: string;
  creator: { id: string; name: string | null; image: string | null };
  completedAt: string | null;
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
  completedCourses: CompletedCourse[];
  recommended: RecommendedCourse[];
}

// ── Chart configs ───────────────────────────────────

const progressChartConfig = {
  progress: { label: "Progress %", color: "rgb(37, 99, 235)" },
} satisfies ChartConfig;

const lessonsChartConfig = {
  completed: { label: "Completed", color: "rgb(37, 99, 235)" },
  remaining: { label: "Remaining", color: "rgb(219, 234, 254)" },
} satisfies ChartConfig;

// ── Custom tooltip ──────────────────────────────────

function ProgressTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; progress: number; completed: number; total: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-1 max-w-[160px] truncate">{d.name}</p>
      <p className="text-blue-600 font-bold">{d.progress}% complete</p>
      <p className="text-gray-500 text-xs mt-0.5">{d.completed} / {d.total} lessons</p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ── Component ───────────────────────────────────────

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const firstName = (session?.user?.name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
    if (status === "authenticated") fetchDashboard();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <CircleNotch className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </StudentLayout>
    );
  }

  const stats = data?.stats ?? {
    totalEnrolled: 0, inProgress: 0, completed: 0,
    totalLessonsCompleted: 0, totalHoursLearned: 0, currentStreak: 0,
  };

  const isEmpty = stats.totalEnrolled === 0;

  // Build chart data from actual enrollments
  const allCourses = [...(data?.recentCourses ?? []), ...(data?.completedCourses ?? []).map(c => ({
    ...c, progress: 100, totalLessons: 0, completedLessons: 0, level: "", lastAccessedAt: c.completedAt,
  }))];

  const progressBarData = (data?.recentCourses ?? []).map((c) => ({
    name: truncate(c.title, 22),
    progress: Math.round(c.progress),
    completed: c.completedLessons,
    total: c.totalLessons,
  }));

  const completionRate = stats.totalEnrolled > 0
    ? Math.round((stats.completed / stats.totalEnrolled) * 100)
    : 0;

  const radialData = [{ name: "Completed", value: completionRate, fill: "rgb(37, 99, 235)" }];

  const categoryMap: Record<string, number> = {};
  (data?.recentCourses ?? []).forEach(c => {
    categoryMap[c.category] = (categoryMap[c.category] ?? 0) + c.completedLessons;
  });
  (data?.completedCourses ?? []).forEach(c => {
    categoryMap[c.category] = (categoryMap[c.category] ?? 0) + 1;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name: truncate(name, 14), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const categoryColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

  return (
    <StudentLayout>
      <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-0.5">{greeting}</p>
            <h1 className="text-2xl font-bold text-gray-900">{firstName} 👋</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/StudentBrowse" className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-sm font-medium rounded-xl transition-colors">
              <Compass className="w-4 h-4" /> Browse
            </Link>
            <Link href="/StudentCourses" className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
              <PlayCircle className="w-4 h-4" weight="fill" /> My Courses
            </Link>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Enrolled */}
          <div className="relative bg-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-200 overflow-hidden flex flex-col justify-between min-h-32.5">
            <svg className="absolute -right-4 -top-4 opacity-10" width="100" height="100" viewBox="0 0 100 100" fill="none">
              <circle cx="75" cy="25" r="40" fill="white"/>
              <circle cx="50" cy="60" r="28" fill="white"/>
            </svg>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Enrolled</p>
            <div>
              <p className="text-5xl font-black text-white tracking-tight leading-none">{stats.totalEnrolled}</p>
              <p className="text-xs text-blue-300 mt-1.5 font-medium">total courses</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col justify-between min-h-32.5">
            <svg className="absolute -right-3 -bottom-3 opacity-[0.07]" width="90" height="90" viewBox="0 0 90 90" fill="none">
              <path d="M45 10 L80 70 L10 70 Z" fill="#7c3aed"/>
              <path d="M45 25 L70 65 L20 65 Z" fill="#7c3aed"/>
            </svg>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest">In Progress</p>
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            </div>
            <div>
              <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">{stats.inProgress}</p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">active now</p>
            </div>
          </div>

          {/* Completed */}
          <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col justify-between min-h-32.5">
            <svg className="absolute -right-2 -bottom-2 opacity-[0.07]" width="90" height="90" viewBox="0 0 90 90" fill="none">
              <rect x="10" y="10" width="70" height="70" rx="14" fill="#059669"/>
              <path d="M28 45 L40 57 L62 33" stroke="#059669" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Completed</p>
            <div>
              <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">{stats.completed}</p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">courses finished</p>
            </div>
          </div>

          {/* Hours Learned */}
          <div className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col justify-between min-h-32.5">
            <svg className="absolute -right-2 -bottom-2 opacity-[0.07]" width="90" height="90" viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="35" fill="#d97706"/>
              <circle cx="45" cy="45" r="22" fill="#d97706"/>
              <line x1="45" y1="20" x2="45" y2="45" stroke="#d97706" strokeWidth="5" strokeLinecap="round"/>
              <line x1="45" y1="45" x2="62" y2="55" stroke="#d97706" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Hours Learned</p>
            <div>
              <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">{stats.totalHoursLearned}</p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">watch time</p>
            </div>
          </div>

        </div>

        {/* ── EMPTY STATE ── */}
        {isEmpty && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Start your learning journey</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">
              Browse our free course catalogue and enrol in anything that interests you.
            </p>
            <Link href="/StudentBrowse" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Compass className="w-4 h-4" /> Explore Courses
            </Link>
          </div>
        )}

        {!isEmpty && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── LEFT: 2/3 ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Course Progress Chart */}
              {progressBarData.length > 0 && (
                <Card className="border border-gray-100 shadow-none rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">Course Progress</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Completion % across active courses</p>
                      </div>
                      <Link href="/StudentCourses" className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View all <CaretRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <ChartContainer config={progressChartConfig} className="w-full" style={{ height: `${Math.max(progressBarData.length * 52, 160)}px` }}>
                      <BarChart
                        data={progressBarData}
                        layout="vertical"
                        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                        barSize={18}
                      >
                        <CartesianGrid strokeDasharray="4 8" stroke="rgb(243,244,246)" horizontal={false} vertical={true} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} axisLine={false} tickLine={false} width={130} />
                        <ChartTooltip content={<ProgressTooltip />} cursor={{ fill: "rgba(219,234,254,0.3)" }} />
                        <Bar dataKey="progress" radius={[0, 6, 6, 0]} background={{ fill: "rgb(239,246,255)", radius: [0, 6, 6, 0] }}>
                          {progressBarData.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={entry.progress === 100 ? "rgb(16,185,129)" : "rgb(37,99,235)"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                    <p className="text-[10px] text-gray-400 mt-3 text-center">Green = 100% complete</p>
                  </CardContent>
                </Card>
              )}

              {/* Two small charts side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Completion Rate Radial */}
                <Card className="border border-gray-100 shadow-none rounded-2xl">
                  <CardContent className="p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-1">Completion Rate</h2>
                    <p className="text-xs text-gray-400 mb-4">Courses finished vs enrolled</p>
                    <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28 shrink-0">
                        <RadialBarChart
                          width={112}
                          height={112}
                          cx={56}
                          cy={56}
                          innerRadius={36}
                          outerRadius={52}
                          data={radialData}
                          startAngle={90}
                          endAngle={90 - 360 * (completionRate / 100)}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "rgb(239,246,255)" }} />
                        </RadialBarChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-xl font-bold text-gray-900">{completionRate}%</p>
                        </div>
                      </div>
                      <div className="space-y-3 flex-1">
                        {[
                          { label: "Completed", value: stats.completed, color: "bg-blue-600" },
                          { label: "In Progress", value: stats.inProgress, color: "bg-blue-200" },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                <span className="text-xs text-gray-500">{item.label}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${item.color}`}
                                style={{ width: `${stats.totalEnrolled > 0 ? (item.value / stats.totalEnrolled) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-gray-50">
                          <p className="text-xs text-gray-400">{stats.totalLessonsCompleted} lessons done total</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lessons by Category Bar */}
                {categoryData.length > 0 && (
                  <Card className="border border-gray-100 shadow-none rounded-2xl">
                    <CardContent className="p-6">
                      <h2 className="text-sm font-bold text-gray-900 mb-1">By Category</h2>
                      <p className="text-xs text-gray-400 mb-4">Lessons completed per subject</p>
                      <ChartContainer config={{ value: { label: "Lessons", color: "rgb(37,99,235)" } }} className="w-full h-40">
                        <BarChart data={categoryData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }} barSize={14}>
                          <CartesianGrid strokeDasharray="4 8" stroke="rgb(243,244,246)" horizontal={true} vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-lg text-xs">
                                  <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                                  <p className="text-blue-600 mt-0.5">{payload[0].value} lessons</p>
                                </div>
                              );
                            }}
                            cursor={{ fill: "rgba(219,234,254,0.3)" }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {categoryData.map((_, i) => (
                              <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Continue Learning list */}
              {data?.recentCourses && data.recentCourses.length > 0 && (
                <Card className="border border-gray-100 shadow-none rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-blue-600" weight="fill" />
                      <h2 className="text-sm font-bold text-gray-900">Continue Learning</h2>
                    </div>
                    <Link href="/StudentCourses" className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      View all <CaretRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.recentCourses.map((course) => (
                      <Link key={course.enrollmentId} href={`/courses/${course.slug}/learn`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-16 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-300" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">{course.category}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{course.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{course.creator.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${course.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-blue-600 shrink-0">{Math.round(course.progress)}%</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-[11px] text-gray-400">{course.completedLessons}/{course.totalLessons}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">lessons</p>
                          {course.lastAccessedAt && <p className="text-[10px] text-gray-300 mt-1">{timeAgo(course.lastAccessedAt)}</p>}
                        </div>
                        <CaretRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Completed */}
              {data?.completedCourses && data.completedCourses.length > 0 && (
                <Card className="border border-gray-100 shadow-none rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" weight="fill" />
                      <h2 className="text-sm font-bold text-gray-900">Completed Courses</h2>
                    </div>
                    <span className="text-xs text-gray-400">{stats.completed} total</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.completedCourses.map((course) => (
                      <Link key={course.enrollmentId} href={`/courses/${course.slug}/learn`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-300" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700 transition-colors">{course.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{course.creator.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                          <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline">Done</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* ── RIGHT: 1/3 ── */}
            <div className="space-y-5">

              {/* Lumi promo */}
              <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm">🦉</span>
                  </div>
                  <span className="text-sm font-bold">Ask Lumi</span>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed mb-3">
                  Stuck on something? Lumi is your AI study assistant — ask anything about your courses.
                </p>
                <button
                  onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Open Lumi AI Study Assistant"]')?.click()}
                  className="w-full py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition-colors border border-white/20"
                >
                  Start a conversation →
                </button>
              </div>

              {/* Recommended */}
              {data?.recommended && data.recommended.length > 0 && (
                <Card className="border border-gray-100 shadow-none rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-blue-600" weight="fill" />
                      <h2 className="text-sm font-bold text-gray-900">Recommended</h2>
                    </div>
                    <Link href="/StudentBrowse" className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.recommended.slice(0, 5).map((course) => (
                      <Link key={course.id} href={`/courses/${course.slug}`}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 mt-0.5">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-3 h-3 text-gray-300" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">{course.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{course.creator.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {course.averageRating ? (
                              <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-amber-400" weight="fill" />
                                <span className="text-[10px] text-gray-500">{course.averageRating.toFixed(1)}</span>
                              </div>
                            ) : null}
                            <div className="flex items-center gap-0.5">
                              <Users className="w-2.5 h-2.5 text-gray-400" />
                              <span className="text-[10px] text-gray-400">{course.enrollmentCount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-50">
                    <Link href="/StudentBrowse"
                      className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      Browse all courses <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      <LumiChat />
    </StudentLayout>
  );
}
