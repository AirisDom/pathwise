"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BookBookmark,
  Bell,
  CaretDown,
  CaretRight,
  Medal,
  FileText,
  FolderOpen,
  GraduationCap,
  House,
  SignOut,
  List,
  Chat,
  Gear,
  UploadSimple,
  Users,
  X,
} from "@phosphor-icons/react";

interface CreatorLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
}

export default function CreatorLayout({ children, activeItem }: CreatorLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coursesExpanded, setCoursesExpanded] = useState(
    pathname.startsWith("/CreatorCourses")
  );

  const creatorName = session?.user?.name ?? "Creator";
  const initials = creatorName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const courseSubItems = [
    { name: "All Courses", icon: FolderOpen, href: "/CreatorCourses/all" },
    { name: "Create New", icon: UploadSimple, href: "/CreatorCourses/create" },
    { name: "Drafts", icon: FileText, href: "/CreatorCourses/drafts" },
    { name: "Published", icon: BookBookmark, href: "/CreatorCourses/published" },
  ];

  const navigationItems = [
    { name: "Dashboard", icon: House, href: "/CreatorDashboard" },
    { name: "Courses", icon: BookOpen, href: "#", expandable: true, subItems: courseSubItems },
    { name: "Students", icon: Users, href: "/CreatorStudents" },
    { name: "Reviews & Ratings", icon: Medal, href: "/CreatorReviews" },
    { name: "Messages", icon: Chat, href: "/CreatorMessages" },
    { name: "Notifications", icon: Bell, href: "/CreatorNotifications" },
    { name: "Settings", icon: Gear, href: "/CreatorSettings" },
  ];

  function isActive(href: string) {
    if (activeItem) return activeItem === href;
    return pathname === href;
  }

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
              {sidebarOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center">
              <img src="/images/logo.png" alt="PathWise" className="h-8 w-auto object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link href="/StudentDashboard">
                <GraduationCap className="w-4 h-4 mr-2" />
                Student View
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{creatorName}</p>
                <p className="text-xs text-gray-500">Course Creator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-18.25 left-0 z-40 h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 overflow-y-auto ${
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
                      className={`flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors ${
                        pathname.startsWith("/CreatorCourses")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {coursesExpanded ? <CaretDown className="w-4 h-4" /> : <CaretRight className="w-4 h-4" />}
                    </button>
                    {coursesExpanded && item.subItems && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                              isActive(sub.href)
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <sub.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
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
                <SignOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-73px)]">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
