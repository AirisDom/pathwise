"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CourseReviews from "@/components/student/CourseReviews";
import CourseNotes from "@/components/student/CourseNotes";
import CourseCertificate from "@/components/student/CourseCertificate";
import LumiChat from "@/components/student/LumiChat";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  Menu,
  SkipBack,
  SkipForward,
  StickyNote,
  Video,
  X,
  Award,
  Star,
  Users,
  Layers,
  PlayCircle,
  ChevronLeft,
  Flame,
  BookMarked,
  Info,
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
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getLessonIcon(type: string, isCompleted: boolean) {
  if (isCompleted) return CheckCircle2;
  switch (type) {
    case "VIDEO": return PlayCircle;
    case "ARTICLE": return FileText;
    default: return BookOpen;
  }
}

// ═══════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════

export default function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
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
          const allIds = new Set(courseData.sections.map((s) => s.id));
          setExpandedSections(allIds);
          let firstUncompleted: Lesson | null = null;
          for (const section of courseData.sections) {
            for (const lesson of section.lessons) {
              if (!lesson.isCompleted && !firstUncompleted) firstUncompleted = lesson;
            }
          }
          setActiveLesson(firstUncompleted ?? courseData.sections[0]?.lessons[0] ?? null);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") fetchCourse();
  }, [slug, status]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setVideoError(false);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markComplete = async (lessonId: string) => {
    if (!data) return;
    setMarkingComplete(true);
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: data.course.id, lessonId, isCompleted: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setCompletedLessons(json.data.completedLessons);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((sec) => ({
              ...sec,
              lessons: sec.lessons.map((l) => l.id === lessonId ? { ...l, isCompleted: true } : l),
            })),
            enrollment: prev.enrollment
              ? { ...prev.enrollment, progress: json.data.progress }
              : prev.enrollment,
          };
        });
        autoAdvance(lessonId);
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const autoAdvance = (currentLessonId: string) => {
    if (!data) return;
    const allLessons = data.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === currentLessonId);
    if (idx >= 0 && idx < allLessons.length - 1) setActiveLesson(allLessons[idx + 1]);
  };

  const navigateLesson = (direction: "prev" | "next") => {
    if (!data || !activeLesson) return;
    const allLessons = data.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (direction === "prev" && idx > 0) setActiveLesson(allLessons[idx - 1]);
    else if (direction === "next" && idx < allLessons.length - 1) setActiveLesson(allLessons[idx + 1]);
  };

  const getCurrentIndex = () => {
    if (!data || !activeLesson) return { current: 0, total: 0 };
    const allLessons = data.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
    return { current: idx + 1, total: allLessons.length };
  };

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
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
          <p className="text-gray-400 mb-6">This course doesn&apos;t exist or you&apos;re not enrolled.</p>
          <Link href="/StudentDashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (data.sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Video className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Content Coming Soon</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">The creator is still building this course. Check back soon!</p>
          <Link href="/StudentCourses" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> My Courses
          </Link>
        </div>
      </div>
    );
  }

  const { current, total } = getCurrentIndex();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ═══ TOP BAR ═══ */}
      <header className="bg-gray-900/95 backdrop-blur border-b border-white/5 h-14 flex items-center px-4 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/StudentCourses" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors shrink-0 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline text-sm font-medium">My Courses</span>
          </Link>
          <div className="w-px h-5 bg-white/10 shrink-0" />
          {/* PathWise logo mark */}
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <BookMarked className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-sm font-semibold text-white truncate">{data.course.title}</h1>
          <span className="hidden md:inline-flex text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-900/40 border border-blue-800/50 px-2 py-0.5 rounded-full shrink-0">
            {data.course.category}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2.5 bg-gray-800/60 border border-white/5 rounded-full px-3 py-1.5">
            <div className="w-24 h-1.5 rounded-full bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-blue-400 whitespace-nowrap">
              {progressPercent}%
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap hidden lg:inline">
              {completedLessons}/{totalLessons}
            </span>
          </div>

          {progressPercent === 100 && (
            <button
              onClick={() => setShowCertificate(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-xs rounded-full transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              Certificate
            </button>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm border border-transparent hover:border-white/10"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-xs hidden xl:inline">{sidebarOpen ? "Close" : "Content"}</span>
          </button>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── VIDEO + CONTENT AREA ─── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* Video Player */}
          <div className="relative bg-black w-full" style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 14rem)" }}>
            {activeLesson?.type === "VIDEO" && activeLesson.videoUrl && !videoError ? (
              <video
                ref={videoRef}
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onEnded={() => { if (activeLesson && !activeLesson.isCompleted) markComplete(activeLesson.id); }}
                onError={() => setVideoError(true)}
                onTimeUpdate={(e) => setVideoCurrentTime((e.target as HTMLVideoElement).currentTime)}
              />
            ) : activeLesson?.type === "ARTICLE" ? (
              <div className="w-full h-full overflow-y-auto p-8 bg-gray-950">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-4">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Reading</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-6">{activeLesson.title}</h2>
                  <div
                    className="prose prose-invert prose-blue prose-sm max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeLesson.articleContent ?? "<p>No content available.</p>" }}
                  />
                </div>
              </div>
            ) : videoError && activeLesson?.type === "VIDEO" ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-950">
                <div className="text-center max-w-md px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Video Unavailable</h3>
                  <p className="text-sm text-gray-400 mb-4">This video couldn&apos;t be loaded. The creator may still be uploading it.</p>
                  <button onClick={() => setVideoError(false)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-950">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">{activeLesson ? "No video for this lesson" : "Select a lesson to start"}</p>
                </div>
              </div>
            )}
          </div>

          {/* ─── LESSON BAR ─── */}
          <div className="bg-gray-900 border-t border-white/5 px-4 lg:px-8 py-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-5xl">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  <span className="font-medium text-blue-400">Lesson {current}</span>
                  <span className="text-gray-700">of {total}</span>
                  {activeLesson?.videoDuration && (
                    <>
                      <span className="text-gray-700">·</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(activeLesson.videoDuration)}</span>
                    </>
                  )}
                  {activeLesson?.isCompleted && (
                    <>
                      <span className="text-gray-700">·</span>
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 font-medium">Completed</span>
                    </>
                  )}
                </div>
                <h2 className="text-base lg:text-lg font-bold text-white truncate">
                  {activeLesson?.title ?? "No lesson selected"}
                </h2>
                {activeLesson?.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">{activeLesson.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigateLesson("prev")}
                  disabled={current <= 1}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed border border-white/5"
                  title="Previous lesson"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {activeLesson && !activeLesson.isCompleted ? (
                  <button
                    onClick={() => markComplete(activeLesson.id)}
                    disabled={markingComplete}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/30"
                  >
                    {markingComplete ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Mark Complete
                  </button>
                ) : activeLesson?.isCompleted ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 rounded-xl text-sm font-semibold border border-blue-800/50">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </div>
                ) : null}

                <button
                  onClick={() => navigateLesson("next")}
                  disabled={current >= total}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed border border-white/5"
                  title="Next lesson"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile progress */}
            <div className="sm:hidden mt-3 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-xs text-gray-500 font-medium">{progressPercent}%</span>
            </div>
          </div>

          {/* ─── TABS ─── */}
          <div className="bg-gray-900/80 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-0 px-4 lg:px-8">
              {[
                { key: "overview" as const, label: "Overview", icon: Info },
                { key: "notes" as const, label: "My Notes", icon: StickyNote },
                { key: "reviews" as const, label: "Reviews", icon: Star },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── TAB CONTENT ─── */}
          <div className="flex-1 bg-gray-950">
            {activeTab === "overview" && <CourseOverviewSection data={data} />}
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
                <CourseReviews courseId={data.course.id} isEnrolled={!!data.enrollment} />
              </div>
            )}
          </div>
        </div>

        {/* ─── DESKTOP SIDEBAR ─── */}
        <aside
          className={`hidden lg:flex flex-col bg-gray-900 border-l border-white/5 shrink-0 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-[360px]" : "w-0 border-l-0"
          }`}
        >
          {sidebarOpen && (
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
          )}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="fixed top-14 right-0 bottom-0 w-80 bg-gray-900 z-50 lg:hidden overflow-hidden flex flex-col shadow-2xl border-l border-white/5">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-semibold text-white text-sm">Course Content</h3>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <X className="w-4 h-4" />
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

      <LumiChat
        courseTitle={data.course.title}
        lessonTitle={activeLesson?.title ?? null}
        lessonType={activeLesson?.type ?? null}
      />

      {showCertificate && progressPercent === 100 && (
        <CourseCertificate
          studentName={session?.user?.name ?? "Student"}
          courseName={data.course.title}
          creatorName={data.course.creator.name ?? "Instructor"}
          completedDate={new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Sidebar
// ═══════════════════════════════════════════

function SidebarContent({
  data, activeLesson, expandedSections, toggleSection, selectLesson,
  progressPercent, completedLessons, totalLessons, onShowCertificate,
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Progress header */}
      <div className="p-4 border-b border-white/5 shrink-0 bg-gray-900/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Progress</span>
          <span className="text-xs font-black text-blue-400">{progressPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{completedLessons} of {totalLessons} lessons</p>
          {progressPercent === 100 && (
            <button
              onClick={onShowCertificate}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Award className="w-3 h-3" />
              View Certificate
            </button>
          )}
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto">
        {data.sections.map((section) => {
          const sectionCompleted = section.lessons.filter((l) => l.isCompleted).length;
          const sectionTotal = section.lessons.length;
          const isExpanded = expandedSections.has(section.id);
          const allDone = sectionCompleted === sectionTotal && sectionTotal > 0;

          return (
            <div key={section.id} className="border-b border-white/[0.04]">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-300 truncate">
                      {section.title}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {sectionCompleted}/{sectionTotal} completed
                      {allDone && <span className="text-blue-400 ml-1">✓</span>}
                    </p>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="w-12 h-1 rounded-full bg-gray-800 overflow-hidden ml-2 shrink-0">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${sectionTotal > 0 ? (sectionCompleted / sectionTotal) * 100 : 0}%` }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="pb-1">
                  {section.lessons.map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const Icon = getLessonIcon(lesson.type, lesson.isCompleted);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full flex items-start gap-3 px-4 pl-10 py-2.5 text-left transition-all ${
                          isActive
                            ? "bg-blue-600/15 border-l-2 border-blue-500"
                            : "hover:bg-white/[0.03] border-l-2 border-transparent"
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            lesson.isCompleted ? "text-blue-400" : isActive ? "text-white" : "text-gray-600"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug ${
                            isActive ? "text-white font-semibold" : lesson.isCompleted ? "text-gray-500" : "text-gray-400"
                          }`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] uppercase font-medium ${
                              lesson.type === "VIDEO" ? "text-blue-500/70" : "text-gray-600"
                            }`}>{lesson.type}</span>
                            {lesson.videoDuration && (
                              <span className="text-[9px] text-gray-700">{formatDuration(lesson.videoDuration)}</span>
                            )}
                          </div>
                        </div>
                        {lesson.isCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0 mt-1" />
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

      {/* Completion banner */}
      {progressPercent === 100 && (
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm font-bold text-white mb-0.5">Course Complete! 🎉</p>
            <p className="text-xs text-gray-500 mb-3">You've finished all lessons</p>
            <button
              onClick={onShowCertificate}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg text-xs font-bold transition-colors"
            >
              Get Your Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Course Overview Tab
// ═══════════════════════════════════════════

function CourseOverviewSection({ data }: { data: CourseData }) {
  const { course } = data;
  const creator = course.creator;
  const profile = creator.creatorProfile;

  return (
    <div className="px-6 lg:px-12 py-10 max-w-4xl mx-auto">

      {/* ── Course title + subtitle ── */}
      <div className="mb-10 pb-8 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            {course.category}
          </span>
          <span className="text-xs text-gray-500 bg-white/[0.04] border border-white/5 px-2.5 py-1 rounded-full">
            {course.level.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500 bg-white/[0.04] border border-white/5 px-2.5 py-1 rounded-full">
            {course.language === "en" ? "English" : course.language}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-snug">{course.title}</h1>
        {course.subtitle && (
          <p className="text-base text-gray-400 leading-relaxed">{course.subtitle}</p>
        )}

        {/* Rating + enrollment inline */}
        <div className="flex flex-wrap items-center gap-5 mt-5">
          {course.averageRating && (
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(course.averageRating!) ? "text-amber-400 fill-amber-400" : "text-gray-700 fill-gray-700"}`}
                />
              ))}
              <span className="text-sm font-semibold text-amber-400 ml-1">{Number(course.averageRating).toFixed(1)}</span>
              <span className="text-xs text-gray-500">({course.reviewCount} reviews)</span>
            </div>
          )}
          {course.enrollmentCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{course.enrollmentCount.toLocaleString()} students enrolled</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>{data.sections.length} sections · {data.totalLessons} lessons</span>
          </div>
        </div>
      </div>

      {/* ── What you'll learn ── */}
      {course.learningOutcomes?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-5">What you&apos;ll learn</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {course.learningOutcomes.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Description ── */}
      <section className="mb-10 pb-8 border-b border-white/5">
        <h2 className="text-lg font-bold text-white mb-4">Course description</h2>
        <p className="text-sm text-gray-400 leading-7 whitespace-pre-line">{course.description}</p>
      </section>

      {/* ── Requirements + Audience side by side ── */}
      {(course.requirements?.length > 0 || course.targetAudience?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-10 mb-10 pb-8 border-b border-white/5">
          {course.requirements?.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-white mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {course.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {course.targetAudience?.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-white mb-4">Who this course is for</h2>
              <ul className="space-y-2.5">
                {course.targetAudience.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* ── Instructor ── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-6">Your instructor</h2>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-blue-600/20 flex items-center justify-center border border-white/10">
            {creator.image ? (
              <img src={creator.image} alt={creator.name ?? ""} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-blue-400">{(creator.name ?? "C")[0]}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white leading-tight">{creator.name}</h3>
            <p className="text-sm text-blue-400 mt-0.5 mb-3">{creator.title ?? profile?.headline ?? "Course Creator"}</p>

            {profile && (
              <div className="flex flex-wrap gap-4 mb-4">
                {profile.totalStudents > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    {profile.totalStudents.toLocaleString()} students
                  </div>
                )}
                {profile.totalCourses > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    {profile.totalCourses} course{profile.totalCourses !== 1 ? "s" : ""}
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Flame className="w-3.5 h-3.5 text-blue-500" />
                    {profile.experienceYears}+ years experience
                  </div>
                )}
                {profile.averageRating && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {Number(profile.averageRating).toFixed(1)} avg rating
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-gray-400 leading-relaxed">
              {profile?.bio ?? creator.bio ?? "Passionate educator committed to helping students learn and grow."}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
