"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CourseReviews from "@/components/student/CourseReviews";
import CourseNotes from "@/components/student/CourseNotes";
import CourseCertificate from "@/components/student/CourseCertificate";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Loader2,
  Lock,
  Menu,
  MessageSquare,
  Pause,
  Play,
  PlayCircle,
  SkipBack,
  SkipForward,
  StickyNote,
  Video,
  X,
  Award,
  BarChart3,
  Star,
  Users,
  Globe,
  Layers,
  GraduationCap,
  Target,
} from "lucide-react";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  videoUrl: string | null;
  videoDuration: number | null;
  articleContent: string | null;
  resourceUrl: string | null;
  isFree: boolean;
  isPreview: boolean;
  isCompleted: boolean;
  watchDuration: number;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    subtitle: string | null;
    thumbnail: string | null;
    category: string;
    level: string;
    language: string;
    learningOutcomes: string[];
    requirements: string[];
    targetAudience: string[];
    enrollmentCount: number;
    averageRating: number | null;
    reviewCount: number;
    creator: {
      id: string;
      name: string | null;
      image: string | null;
      title: string | null;
      bio: string | null;
      creatorProfile: {
        headline: string | null;
        expertise: string | null;
        experienceYears: number | null;
        bio: string | null;
        totalStudents: number;
        totalCourses: number;
        averageRating: number | null;
      } | null;
    };
  };
  sections: Section[];
  enrollment: { id: string; progress: number; isCompleted: boolean } | null;
  totalLessons: number;
  completedLessons: number;
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getLessonIcon(type: string, isCompleted: boolean) {
  if (isCompleted) return CheckCircle2;
  switch (type) {
    case "VIDEO":
      return PlayCircle;
    case "ARTICLE":
      return FileText;
    default:
      return BookOpen;
  }
}

// ═══════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════

export default function CourseLearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session, status } = useSession();

  const [data, setData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "reviews">("overview");
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Fetch course data ──
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/student/learn/${slug}`);
        if (res.ok) {
          const json = await res.json();
          const courseData: CourseData = json.data;
          setData(courseData);
          setCompletedLessons(courseData.completedLessons);
          setTotalLessons(courseData.totalLessons);

          // Expand all sections by default
          const allIds = new Set(courseData.sections.map((s) => s.id));
          setExpandedSections(allIds);

          // Set first uncompleted lesson as active, or the first lesson
          let firstUncompleted: Lesson | null = null;
          for (const section of courseData.sections) {
            for (const lesson of section.lessons) {
              if (!lesson.isCompleted && !firstUncompleted) {
                firstUncompleted = lesson;
              }
            }
          }
          setActiveLesson(
            firstUncompleted ?? courseData.sections[0]?.lessons[0] ?? null
          );
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") fetchCourse();
  }, [slug, status]);

  // ── Toggle section ──
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // ── Select lesson ──
  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setVideoError(false);
    setMobileSidebarOpen(false);
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Mark lesson complete ──
  const markComplete = async (lessonId: string) => {
    if (!data) return;
    setMarkingComplete(true);
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: data.course.id,
          lessonId,
          isCompleted: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setCompletedLessons(json.data.completedLessons);

        // Update local state
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((sec) => ({
              ...sec,
              lessons: sec.lessons.map((l) =>
                l.id === lessonId ? { ...l, isCompleted: true } : l
              ),
            })),
            enrollment: prev.enrollment
              ? { ...prev.enrollment, progress: json.data.progress }
              : prev.enrollment,
          };
        });

        // Auto-advance to next lesson
        autoAdvance(lessonId);
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  // ── Auto-advance to next lesson ──
  const autoAdvance = (currentLessonId: string) => {
    if (!data) return;
    const allLessons = data.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === currentLessonId);
    if (idx >= 0 && idx < allLessons.length - 1) {
      setActiveLesson(allLessons[idx + 1]);
    }
  };

  // ── Navigate prev/next ──
  const navigateLesson = (direction: "prev" | "next") => {
    if (!data || !activeLesson) return;
    const allLessons = data.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (direction === "prev" && idx > 0) {
      setActiveLesson(allLessons[idx - 1]);
    } else if (direction === "next" && idx < allLessons.length - 1) {
      setActiveLesson(allLessons[idx + 1]);
    }
  };

  // ── Get current lesson index ──
  const getCurrentIndex = () => {
    if (!data || !activeLesson) return { current: 0, total: 0 };
    const allLessons = data.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
    return { current: idx + 1, total: allLessons.length };
  };

  // ── Progress percentage ──
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // ═══════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-gray-400 mb-6">
            This course doesn&apos;t exist or you&apos;re not enrolled.
          </p>
          <Link
            href="/StudentDashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Empty course — no sections/lessons added yet
  if (data.sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Video className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Content Coming Soon
          </h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            The creator is still building this course. Check back soon for new
            lessons!
          </p>
          <Link
            href="/StudentCourses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const { current, total } = getCurrentIndex();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* ═══════════════════════════════════════ */}
      {/* TOP BAR */}
      {/* ═══════════════════════════════════════ */}
      <header className="bg-gray-900 border-b border-gray-800 h-14 flex items-center px-4 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Back */}
          <Link
            href="/StudentCourses"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Back</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700 shrink-0" />

          {/* Course title */}
          <h1 className="text-sm font-medium text-white truncate">
            {data.course.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {completedLessons}/{totalLessons} ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
          >
            {sidebarOpen ? (
              <>
                <X className="w-4 h-4" />
                <span className="hidden xl:inline">Close sidebar</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" />
                <span className="hidden xl:inline">Course content</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════ */}
      {/* MAIN LAYOUT */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── VIDEO / CONTENT AREA ─── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video Player */}
          <div className="relative bg-black aspect-video w-full max-h-[calc(100vh-14rem)] lg:max-h-[calc(100vh-10rem)]">
            {activeLesson?.type === "VIDEO" && activeLesson.videoUrl && !videoError ? (
              <video
                ref={videoRef}
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                autoPlay
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
                onEnded={() => {
                  if (activeLesson && !activeLesson.isCompleted) {
                    markComplete(activeLesson.id);
                  }
                }}
                onError={() => setVideoError(true)}
                onTimeUpdate={(e) => setVideoCurrentTime((e.target as HTMLVideoElement).currentTime)}
              />
            ) : activeLesson?.type === "ARTICLE" ? (
              <div className="w-full h-full overflow-y-auto p-8 bg-gray-950">
                <div className="max-w-3xl mx-auto prose prose-invert prose-emerald">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {activeLesson.title}
                  </h2>
                  <div
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: activeLesson.articleContent ?? "<p>No content available.</p>",
                    }}
                  />
                </div>
              </div>
            ) : videoError && activeLesson?.type === "VIDEO" ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-950">
                <div className="text-center max-w-md px-4">
                  <Video className="w-14 h-14 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Video Unavailable
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This video couldn&apos;t be loaded. The creator may still be
                    uploading it, or the link may have expired.
                  </p>
                  <button
                    onClick={() => {
                      setVideoError(false);
                    }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-950">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {activeLesson
                      ? "No video available for this lesson"
                      : "Select a lesson to start learning"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── LESSON INFO BAR ─── */}
          <div className="bg-gray-900 border-t border-gray-800 px-4 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span>
                    Lesson {current} of {total}
                  </span>
                  {activeLesson?.videoDuration && (
                    <>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(activeLesson.videoDuration)}</span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-white truncate">
                  {activeLesson?.title ?? "No lesson selected"}
                </h2>
                {activeLesson?.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {activeLesson.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Prev */}
                <button
                  onClick={() => navigateLesson("prev")}
                  disabled={current <= 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous lesson"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Mark complete */}
                {activeLesson && !activeLesson.isCompleted ? (
                  <button
                    onClick={() => markComplete(activeLesson.id)}
                    disabled={markingComplete}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {markingComplete ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Mark Complete
                  </button>
                ) : activeLesson?.isCompleted ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/50 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </div>
                ) : null}

                {/* Next */}
                <button
                  onClick={() => navigateLesson("next")}
                  disabled={current >= total}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next lesson"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile progress bar */}
            <div className="sm:hidden mt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* ─── TABS: Overview / Notes / Reviews ─── */}
          <div className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-4xl mx-auto px-4 lg:px-8">
              <div className="flex items-center gap-1 border-b border-gray-800">
                {[
                  { key: "overview" as const, label: "Overview", icon: BookOpen },
                  { key: "notes" as const, label: "Notes", icon: StickyNote },
                  { key: "reviews" as const, label: "Reviews", icon: Star },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-emerald-500 text-emerald-400"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── TAB CONTENT ─── */}
          <div className="bg-gray-950">
            {activeTab === "overview" && <CourseInfoSection data={data} />}
            {activeTab === "notes" && (
              <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
                <CourseNotes
                  courseId={data.course.id}
                  activeLessonId={activeLesson?.id ?? null}
                  activeLessonTitle={activeLesson?.title ?? null}
                  currentVideoTime={videoCurrentTime}
                  onSeekTo={(time) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                      videoRef.current.play();
                    }
                  }}
                />
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
                <CourseReviews
                  courseId={data.course.id}
                  isEnrolled={!!data.enrollment}
                />
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDEBAR — SECTIONS & LESSONS ─── */}
        {/* Desktop */}
        <aside
          className={`hidden lg:flex flex-col w-96 bg-gray-900 border-l border-gray-800 shrink-0 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-96" : "w-0 border-l-0"
          }`}
        >
          {sidebarOpen && <SidebarContent
            data={data}
            activeLesson={activeLesson}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            selectLesson={selectLesson}
            progressPercent={progressPercent}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
            onShowCertificate={() => setShowCertificate(true)}
          />}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="fixed top-14 right-0 bottom-0 w-80 bg-gray-900 z-50 lg:hidden overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white text-sm">Course Content</h3>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent
                data={data}
                activeLesson={activeLesson}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                selectLesson={selectLesson}
                progressPercent={progressPercent}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                onShowCertificate={() => setShowCertificate(true)}
              />
            </aside>
          </>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && progressPercent === 100 && (
        <CourseCertificate
          studentName={session?.user?.name ?? "Student"}
          courseName={data.course.title}
          creatorName={data.course.creator.name ?? "Instructor"}
          completedDate={new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Sidebar Content Component
// ═══════════════════════════════════════════

function SidebarContent({
  data,
  activeLesson,
  expandedSections,
  toggleSection,
  selectLesson,
  progressPercent,
  completedLessons,
  totalLessons,
  onShowCertificate,
}: {
  data: CourseData;
  activeLesson: Lesson | null;
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
  selectLesson: (lesson: Lesson) => void;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  onShowCertificate: () => void;
}) {
  return (
    <>
      {/* Progress Header */}
      <div className="p-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Your Progress
          </span>
          <span className="text-xs font-bold text-emerald-400">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedLessons} of {totalLessons} lessons completed
        </p>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        {data.sections.map((section) => {
          const sectionCompleted = section.lessons.filter((l) => l.isCompleted).length;
          const sectionTotal = section.lessons.length;
          const isExpanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="border-b border-gray-800/50">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      Section {section.order}: {section.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sectionCompleted}/{sectionTotal} lessons
                      {sectionCompleted === sectionTotal && sectionTotal > 0 && (
                        <span className="text-emerald-400 ml-1">✓</span>
                      )}
                    </p>
                  </div>
                </div>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="pb-1">
                  {section.lessons.map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const Icon = getLessonIcon(lesson.type, lesson.isCompleted);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full flex items-start gap-3 px-4 pl-11 py-3 text-left transition-colors ${
                          isActive
                            ? "bg-gray-800 border-l-2 border-emerald-500"
                            : "hover:bg-gray-800/30 border-l-2 border-transparent"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            lesson.isCompleted
                              ? "text-emerald-400"
                              : isActive
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm truncate ${
                              isActive
                                ? "text-white font-medium"
                                : lesson.isCompleted
                                ? "text-gray-400"
                                : "text-gray-300"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-600 uppercase">
                              {lesson.type}
                            </span>
                            {lesson.videoDuration && (
                              <span className="text-[10px] text-gray-600">
                                {formatDuration(lesson.videoDuration)}
                              </span>
                            )}
                          </div>
                        </div>
                        {lesson.isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Completion */}
      {progressPercent === 100 && (
        <div className="p-4 border-t border-gray-800 shrink-0">
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-4 text-center">
            <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-400">
              Course Completed! 🎉
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Congratulations on finishing all lessons
            </p>
            <button
              onClick={onShowCertificate}
              className="mt-3 flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              View Certificate
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Course & Creator Info Component
// ═══════════════════════════════════════════

function CourseInfoSection({ data }: { data: CourseData }) {
  const { course } = data;
  const creator = course.creator;
  const profile = creator.creatorProfile;

  return (
    <div className="bg-gray-950 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* ── About the Instructor ── */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            About the Instructor
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {creator.image ? (
                <img
                  src={creator.image}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (creator.name ?? "C")[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-white">
                {creator.name}
              </h4>
              <p className="text-sm text-emerald-400 font-medium">
                {creator.title ?? profile?.headline ?? "Course Creator"}
              </p>

              {profile && (
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                  {profile.expertise && (
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      {profile.expertise}
                    </div>
                  )}
                  {profile.experienceYears && (
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      {profile.experienceYears}+ years
                    </div>
                  )}
                  {profile.totalStudents > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {profile.totalStudents.toLocaleString()} students
                    </div>
                  )}
                  {profile.totalCourses > 0 && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {profile.totalCourses} courses
                    </div>
                  )}
                  {profile.averageRating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {Number(profile.averageRating).toFixed(1)} avg rating
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                {profile?.bio ??
                  creator.bio ??
                  "Passionate educator committed to helping students learn and grow."}
              </p>
            </div>
          </div>
        </div>

        {/* ── About this Course ── */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            About This Course
          </h3>

          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {course.description}
          </p>

          {/* Course meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-5">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              {course.level.replace("_", " ")}
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {data.sections.length} sections, {data.totalLessons} lessons
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {course.language === "en" ? "English" : course.language}
            </div>
            {course.enrollmentCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {course.enrollmentCount.toLocaleString()} enrolled
              </div>
            )}
            {course.averageRating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {Number(course.averageRating).toFixed(1)} ({course.reviewCount}{" "}
                reviews)
              </div>
            )}
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-white mb-2.5 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                What You&apos;ll Learn
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {course.learningOutcomes.map((item: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-white mb-2.5">
                Requirements
              </h4>
              <ul className="space-y-1.5">
                {course.requirements.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Target Audience */}
          {course.targetAudience && course.targetAudience.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2.5">
                Who This Course Is For
              </h4>
              <ul className="space-y-1.5">
                {course.targetAudience.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
