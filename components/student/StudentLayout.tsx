"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Bell,
  CalendarBlank,
  CaretDown,
  Compass,
  Flame,
  GraduationCap,
  House,
  SquaresFour,
  SignOut,
  List,
  Chat,
  MagnifyingGlass,
  Gear,
  Trophy,
  User,
  X,
  Lightning,
  ChartBar,
  Heart,
  Clock,
} from "@phosphor-icons/react";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userName = session?.user?.name ?? "Student";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const topNavItems = [
    { name: "Dashboard", icon: SquaresFour, href: "/StudentDashboard" },
    { name: "Browse", icon: Compass, href: "/StudentBrowse" },
    { name: "My Courses", icon: BookOpen, href: "/StudentCourses" },
    { name: "Progress", icon: ChartBar, href: "/StudentProgress" },
  ];

  const sideQuickLinks = [
    { name: "Favorites", icon: Heart, href: "/StudentFavorites" },
    { name: "CalendarBlank", icon: CalendarBlank, href: "/StudentCalendar" },
    { name: "Messages", icon: Chat, href: "/StudentMessages" },
    { name: "Gear", icon: Gear, href: "/StudentSettings" },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/StudentBrowse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ═══════════════════════════════════════ */}
      {/* TOP NAVIGATION BAR */}
      {/* ═══════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link href="/StudentDashboard" className="flex items-center shrink-0">
                <img src="/images/logo.png" alt="PathWise" className="h-8 w-auto object-contain" />
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {topNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: MagnifyingGlass */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="MagnifyingGlass courses, topics, or skills..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Right: Actions + Profile */}
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold">
                <Flame className="w-4 h-4" />
                <span>0</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <CaretDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-500">{userEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
                        <div className="bg-white p-3 text-center">
                          <p className="text-lg font-bold text-gray-900">0</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Courses</p>
                        </div>
                        <div className="bg-white p-3 text-center">
                          <p className="text-lg font-bold text-gray-900">0</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Streak</p>
                        </div>
                        <div className="bg-white p-3 text-center">
                          <p className="text-lg font-bold text-gray-900">0</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Badges</p>
                        </div>
                      </div>

                      {/* List Items */}
                      <div className="p-2">
                        <Link
                          href="/StudentSettings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          href="/StudentProgress"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Trophy className="w-4 h-4" />
                          Achievements
                        </Link>
                        <Link
                          href="/StudentSettings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Gear className="w-4 h-4" />
                          Gear
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={() => signOut({ callbackUrl: "/login" })}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <SignOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════ */}
      {/* MOBILE NAV DRAWER */}
      {/* ═══════════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-16 left-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-xl overflow-y-auto">
            {/* Mobile MagnifyingGlass */}
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="MagnifyingGlass courses..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Nav Links */}
            <nav className="p-3 space-y-1">
              {topNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-gray-100">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Links</p>
                {sideQuickLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ═══════════════════════════════════════ */}
      <main className="max-w-[1800px] mx-auto">
        {children}
      </main>
    </div>
  );
}
