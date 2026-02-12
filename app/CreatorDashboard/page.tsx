"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FeaturesDetail from "@/components/ui/features-detail";
import StatisticsCards from "@/components/ui/statistics-cards";
import RevenueChart from "@/components/ui/revenue-chart";
import type { RevenueDataPoint, RevenueSummary } from "@/components/ui/revenue-chart";
import StudentGrowthChart from "@/components/ui/student-growth-chart";
import CourseEngagementChart from "@/components/ui/course-engagement-chart";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Menu,
  PlayCircle,
  Settings,
  TrendingUp,
  Users,
  Video,
  X,
  Bell,
  Calendar,
  Award,
  BookMarked,
  Upload,
  Loader2,
} from "lucide-react";

interface StatData {
  title: string;
  value: number;
  delta: number;
  lastMonth: number;
  positive: boolean;
  prefix: string;
  suffix: string;
}

export default function CreatorDashboard() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [stats, setStats] = useState<StatData[]>([
    { title: "Total Students",      value: 0, delta: 0, lastMonth: 0, positive: true, prefix: "", suffix: "" },
    { title: "Monthly Enrollments", value: 0, delta: 0, lastMonth: 0, positive: true, prefix: "", suffix: "" },
    { title: "Active Courses",      value: 0, delta: 0, lastMonth: 0, positive: true, prefix: "", suffix: "" },
    { title: "Total Views",         value: 0, delta: 0, lastMonth: 0, positive: true, prefix: "", suffix: "" },
  ]);
  const [creatorInfo, setCreatorInfo] = useState<{ name: string; image: string | null }>({ name: "Creator", image: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | undefined>(undefined);
  const [revenueLoading, setRevenueLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/creator/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setCreatorInfo(data.creator);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    async function fetchRevenue() {
      try {
        const res = await fetch("/api/creator/revenue");
        if (res.ok) {
          const data = await res.json();
          setRevenueData(data.chartData);
          setRevenueSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load revenue data:", err);
      } finally {
        setRevenueLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
      fetchRevenue();
    }
  }, [status]);

  const navigationItems = [
    { name: "Dashboard", icon: Home, href: "/CreatorDashboard", active: true },
    { name: "Analytics", icon: BarChart3, href: "/CreatorAnalytics", active: false },
    { 
      name: "Courses", 
      icon: BookOpen, 
      href: "#", 
      active: false, 
      expandable: true,
      subItems: [
        { name: "All Courses", icon: FolderOpen, href: "/CreatorCourses/all" },
        { name: "Create New", icon: Upload, href: "/CreatorCourses/create" },
        { name: "Drafts", icon: FileText, href: "/CreatorCourses/drafts" },
        { name: "Published", icon: BookMarked, href: "/CreatorCourses/published" },
      ]
    },
    { name: "Content Studio", icon: Video, href: "/CreatorStudio", active: false },
    { name: "Students", icon: Users, href: "/CreatorStudents", active: false },
    { name: "Reviews & Ratings", icon: Award, href: "/CreatorReviews", active: false },
    { name: "Messages", icon: MessageSquare, href: "/CreatorMessages", active: false },
    { name: "Revenue", icon: DollarSign, href: "/CreatorRevenue", active: false },
    { name: "Calendar", icon: Calendar, href: "/CreatorCalendar", active: false },
    { name: "Notifications", icon: Bell, href: "/CreatorNotifications", active: false },
    { name: "Settings", icon: Settings, href: "/CreatorSettings", active: false },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center">
              <img
                src="/images/logo.png"
                alt="PathWise"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{creatorInfo.name}</p>
                <p className="text-xs text-gray-500">Course Creator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {creatorInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-18.25 left-0 z-40 h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.name}>
                {item.expandable ? (
                  <>
                    <button
                      onClick={() => setCoursesExpanded(!coursesExpanded)}
                      className="flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {coursesExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {coursesExpanded && item.subItems && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="mb-8">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-500">Loading dashboard stats…</span>
              </div>
            ) : (
              <StatisticsCards stats={stats} />
            )}
          </div>

          {/* Advanced Revenue Chart */}
          <div className="mb-8">
            <RevenueChart
              data={revenueData}
              summary={revenueSummary}
              loading={revenueLoading}
            />
          </div>

          {/* Area Charts - Student Growth & Course Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StudentGrowthChart />
            <CourseEngagementChart />
          </div>

          {/* Features Detail Section */}
          <div className="mb-8">
            <FeaturesDetail />
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
