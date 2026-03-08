"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit3,
  FileText,
  GripVertical,
  Layers,
  Loader2,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  Video,
  X,
  Eye,
  CheckCircle2,
} from "lucide-react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

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
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string | null;
}

// ═══════════════════════════════════════
// Page Component
// ═══════════════════════════════════════

export default function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Modals
  const [sectionModal, setSectionModal] = useState<{
    open: boolean;
    editId?: string;
    title: string;
    description: string;
  }>({ open: false, title: "", description: "" });

  const [lessonModal, setLessonModal] = useState<{
    open: boolean;
    sectionId: string;
    editId?: string;
    title: string;
    description: string;
    type: string;
    videoUrl: string;
    videoDuration: string;
    articleContent: string;
    isFree: boolean;
    isPreview: boolean;
  }>({
    open: false,
    sectionId: "",
    title: "",
    description: "",
    type: "VIDEO",
    videoUrl: "",
    videoDuration: "",
    articleContent: "",
    isFree: false,
    isPreview: false,
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Fetch course + sections ──
  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/sections`),
      ]);

      if (courseRes.ok) {
        const cJson = await courseRes.json();
        setCourse(cJson.data);
      }

      if (sectionsRes.ok) {
        const sJson = await sectionsRes.json();
        setSections(sJson.data ?? []);
        // Expand all sections by default
        const allIds = new Set<string>(
          (sJson.data ?? []).map((s: Section) => s.id)
        );
        setExpandedSections(allIds);
      }
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Toast helper ──
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Toggle section ──
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // ═══════════════════════════════════════
  // SECTION CRUD
  // ═══════════════════════════════════════

  const openAddSection = () =>
    setSectionModal({ open: true, title: "", description: "" });

  const openEditSection = (section: Section) =>
    setSectionModal({
      open: true,
      editId: section.id,
      title: section.title,
      description: section.description ?? "",
    });

  const closeSectionModal = () =>
    setSectionModal({ open: false, title: "", description: "" });

  const saveSection = async () => {
    if (!sectionModal.title.trim()) return;
    setSaving(true);
    try {
      if (sectionModal.editId) {
        // Update
        const res = await fetch(
          `/api/courses/${id}/sections/${sectionModal.editId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: sectionModal.title,
              description: sectionModal.description || undefined,
            }),
          }
        );
        if (res.ok) {
          showToast("Section updated!");
          await fetchData();
        } else {
          showToast("Failed to update section", "error");
        }
      } else {
        // Create
        const res = await fetch(`/api/courses/${id}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sectionModal.title,
            description: sectionModal.description || undefined,
          }),
        });
        if (res.ok) {
          showToast("Section added!");
          await fetchData();
        } else {
          showToast("Failed to add section", "error");
        }
      }
      closeSectionModal();
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons? This cannot be undone."))
      return;
    try {
      const res = await fetch(`/api/courses/${id}/sections/${sectionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Section deleted");
        await fetchData();
      } else {
        showToast("Failed to delete section", "error");
      }
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  // ═══════════════════════════════════════
  // LESSON CRUD
  // ═══════════════════════════════════════

  const openAddLesson = (sectionId: string) =>
    setLessonModal({
      open: true,
      sectionId,
      title: "",
      description: "",
      type: "VIDEO",
      videoUrl: "",
      videoDuration: "",
      articleContent: "",
      isFree: false,
      isPreview: false,
    });

  const openEditLesson = (sectionId: string, lesson: Lesson) =>
    setLessonModal({
      open: true,
      sectionId,
      editId: lesson.id,
      title: lesson.title,
      description: lesson.description ?? "",
      type: lesson.type,
      videoUrl: lesson.videoUrl ?? "",
      videoDuration: lesson.videoDuration?.toString() ?? "",
      articleContent: lesson.articleContent ?? "",
      isFree: lesson.isFree,
      isPreview: lesson.isPreview,
    });

  const closeLessonModal = () =>
    setLessonModal({
      open: false,
      sectionId: "",
      title: "",
      description: "",
      type: "VIDEO",
      videoUrl: "",
      videoDuration: "",
      articleContent: "",
      isFree: false,
      isPreview: false,
    });

  const saveLesson = async () => {
    if (!lessonModal.title.trim()) return;
    setSaving(true);

    const payload = {
      title: lessonModal.title,
      description: lessonModal.description || undefined,
      type: lessonModal.type,
      videoUrl: lessonModal.videoUrl || undefined,
      videoDuration: lessonModal.videoDuration
        ? parseInt(lessonModal.videoDuration, 10)
        : undefined,
      articleContent: lessonModal.articleContent || undefined,
      isFree: lessonModal.isFree,
      isPreview: lessonModal.isPreview,
    };

    try {
      if (lessonModal.editId) {
        const res = await fetch(
          `/api/courses/${id}/sections/${lessonModal.sectionId}/lessons/${lessonModal.editId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (res.ok) {
          showToast("Lesson updated!");
          await fetchData();
        } else {
          showToast("Failed to update lesson", "error");
        }
      } else {
        const res = await fetch(
          `/api/courses/${id}/sections/${lessonModal.sectionId}/lessons`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (res.ok) {
          showToast("Lesson added!");
          await fetchData();
        } else {
          showToast("Failed to add lesson", "error");
        }
      }
      closeLessonModal();
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    try {
      const res = await fetch(
        `/api/courses/${id}/sections/${sectionId}/lessons/${lessonId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showToast("Lesson deleted");
        await fetchData();
      } else {
        showToast("Failed to delete lesson", "error");
      }
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  // ═══════════════════════════════════════
  // Stats
  // ═══════════════════════════════════════
  const totalSections = sections.length;
  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const totalDuration = sections.reduce(
    (s, sec) =>
      s +
      sec.lessons.reduce(
        (ls, l) => ls + (l.videoDuration ?? 0),
        0
      ),
    0
  );

  const formatTotalDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Course Not Found
          </h2>
          <Link
            href="/creator/courses"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── TOAST ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-100 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/creator/courses"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      course.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : course.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {course.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {course.category} • {course.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/courses/${course.slug}/learn`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Layers className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{totalSections}</p>
            <p className="text-xs text-gray-500">Sections</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <PlayCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-xs text-gray-500">Lessons</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Video className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">
              {formatTotalDuration(totalDuration)}
            </p>
            <p className="text-xs text-gray-500">Total Duration</p>
          </div>
        </div>

        {/* ── ADD SECTION BUTTON ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Course Content
          </h2>
          <button
            onClick={openAddSection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        {/* ── EMPTY STATE ── */}
        {sections.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No sections yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Start building your course by adding sections and lessons.
            </p>
            <button
              onClick={openAddSection}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Your First Section
            </button>
          </div>
        )}

        {/* ── SECTIONS LIST ── */}
        <div className="space-y-3">
          {sections.map((section, sIdx) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionDuration = section.lessons.reduce(
              (s, l) => s + (l.videoDuration ?? 0),
              0
            );

            return (
              <div
                key={section.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0" onClick={() => toggleSection(section.id)}>
                    <h3 className="font-semibold text-gray-900 cursor-pointer">
                      Section {section.order}: {section.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {section.lessons.length} lesson
                      {section.lessons.length !== 1 && "s"}
                      {sectionDuration > 0 &&
                        ` • ${formatTotalDuration(sectionDuration)}`}
                      {section.description && ` — ${section.description}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openAddLesson(section.id)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Add lesson"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditSection(section)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                      title="Edit section"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title="Delete section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {isExpanded && (
                  <div>
                    {section.lessons.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <p className="text-sm text-gray-400 mb-3">
                          No lessons in this section
                        </p>
                        <button
                          onClick={() => openAddLesson(section.id)}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          + Add a lesson
                        </button>
                      </div>
                    ) : (
                      <div>
                        {section.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors group"
                          >
                            {/* Order number */}
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                              {lesson.order}
                            </span>

                            {/* Icon */}
                            {lesson.type === "VIDEO" ? (
                              <PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : lesson.type === "ARTICLE" ? (
                              <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400 uppercase font-medium">
                                  {lesson.type}
                                </span>
                                {lesson.videoDuration && (
                                  <span className="text-[10px] text-gray-400">
                                    {Math.floor(lesson.videoDuration / 60)}:
                                    {(lesson.videoDuration % 60)
                                      .toString()
                                      .padStart(2, "0")}
                                  </span>
                                )}
                                {lesson.isFree && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                    Free
                                  </span>
                                )}
                                {lesson.isPreview && (
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                    Preview
                                  </span>
                                )}
                                {lesson.videoUrl && (
                                  <span className="text-[10px] text-emerald-600">
                                    ✓ Video attached
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() =>
                                  openEditLesson(section.id, lesson)
                                }
                                className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit lesson"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteLesson(section.id, lesson.id)
                                }
                                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete lesson"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add lesson at bottom */}
                        <button
                          onClick={() => openAddLesson(section.id)}
                          className="w-full flex items-center gap-2 px-5 py-3 text-sm text-blue-600 hover:bg-blue-50/50 transition-colors font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add Lesson
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add section at bottom */}
        {sections.length > 0 && (
          <button
            onClick={openAddSection}
            className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Another Section
          </button>
        )}
      </main>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION MODAL */}
      {/* ═══════════════════════════════════════ */}
      {sectionModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {sectionModal.editId ? "Edit Section" : "Add New Section"}
              </h3>
              <button
                onClick={closeSectionModal}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sectionModal.title}
                  onChange={(e) =>
                    setSectionModal((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Getting Started"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={sectionModal.description}
                  onChange={(e) =>
                    setSectionModal((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this section"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button
                onClick={closeSectionModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSection}
                disabled={saving || !sectionModal.title.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {sectionModal.editId ? "Update" : "Add Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* LESSON MODAL */}
      {/* ═══════════════════════════════════════ */}
      {lessonModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">
                {lessonModal.editId ? "Edit Lesson" : "Add New Lesson"}
              </h3>
              <button
                onClick={closeLessonModal}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonModal.title}
                  onChange={(e) =>
                    setLessonModal((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Introduction to Variables"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={lessonModal.description}
                  onChange={(e) =>
                    setLessonModal((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What will students learn in this lesson?"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Type
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "VIDEO", label: "Video", icon: PlayCircle },
                    { value: "ARTICLE", label: "Article", icon: FileText },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        setLessonModal((p) => ({ ...p, type: t.value }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        lessonModal.type === t.value
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video fields */}
              {lessonModal.type === "VIDEO" && (
                <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={lessonModal.videoUrl}
                      onChange={(e) =>
                        setLessonModal((p) => ({
                          ...p,
                          videoUrl: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/video.mp4 or uploaded URL"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste a direct video URL (MP4, WebM) or use the file
                      upload on the course creation page
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={lessonModal.videoDuration}
                      onChange={(e) =>
                        setLessonModal((p) => ({
                          ...p,
                          videoDuration: e.target.value,
                        }))
                      }
                      placeholder="e.g. 360 (= 6 minutes)"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Article content */}
              {lessonModal.type === "ARTICLE" && (
                <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Article Content (HTML)
                  </label>
                  <textarea
                    value={lessonModal.articleContent}
                    onChange={(e) =>
                      setLessonModal((p) => ({
                        ...p,
                        articleContent: e.target.value,
                      }))
                    }
                    placeholder="<h3>Heading</h3><p>Your article content...</p>"
                    rows={6}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono resize-none"
                  />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonModal.isFree}
                    onChange={(e) =>
                      setLessonModal((p) => ({
                        ...p,
                        isFree: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Free lesson
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonModal.isPreview}
                    onChange={(e) =>
                      setLessonModal((p) => ({
                        ...p,
                        isPreview: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Preview lesson
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={closeLessonModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveLesson}
                disabled={saving || !lessonModal.title.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {lessonModal.editId ? "Update Lesson" : "Add Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
