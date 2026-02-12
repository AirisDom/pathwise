"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  Loader2,
  Check,
  Image as ImageIcon,
  Video,
  X,
  AlertCircle,
  Upload,
} from "lucide-react";
import FileUpload from "@/components/creator/FileUpload";

// ── Types ──
interface LessonForm {
  id?: string;
  title: string;
  description: string;
  type: "VIDEO" | "ARTICLE" | "QUIZ" | "RESOURCE" | "ASSIGNMENT";
  videoUrl: string;
  isFree: boolean;
}

interface SectionForm {
  id?: string;
  title: string;
  description: string;
  expanded: boolean;
  lessons: LessonForm[];
}

interface CourseForm {
  title: string;
  description: string;
  subtitle: string;
  category: string;
  subcategory: string;
  level: string;
  language: string;
  tags: string;
  thumbnail: string;
  previewVideo: string;
  learningOutcomes: string;
  requirements: string;
  targetAudience: string;
}

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "UI/UX Design",
  "Game Development",
  "Blockchain",
  "Other",
];

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All Levels" },
];

const emptyLesson = (): LessonForm => ({
  title: "",
  description: "",
  type: "VIDEO",
  videoUrl: "",
  isFree: false,
});

const emptySection = (): SectionForm => ({
  title: "",
  description: "",
  expanded: true,
  lessons: [emptyLesson()],
});

// ── Toast Notification ──
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { status } = useSession();

  // Course ID — once saved to draft, we track it
  const [courseId, setCourseId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    subtitle: "",
    category: "",
    subcategory: "",
    level: "BEGINNER",
    language: "en",
    tags: "",
    thumbnail: "",
    previewVideo: "",
    learningOutcomes: "",
    requirements: "",
    targetAudience: "",
  });

  const [sections, setSections] = useState<SectionForm[]>([emptySection()]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save timer
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useRef(false);

  // Show toast
  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }

  // ── Auto-save logic ──
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges.current) return;
    if (!form.title || form.title.length < 3) return; // Need a title to save
    if (!form.description || form.description.length < 10) return;
    if (!form.category) return;

    setSaving(true);
    try {
      const courseData = buildCoursePayload();

      if (courseId) {
        // Update existing draft
        await fetch(`/api/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });
      } else {
        // Create new draft
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });
        if (res.ok) {
          const json = await res.json();
          setCourseId(json.data?.id);
          // Save sections
          if (json.data?.id) {
            await saveSections(json.data.id);
          }
        }
      }

      hasUnsavedChanges.current = false;
      showToast("Draft saved automatically");
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [form, sections, courseId]);

  // Watch for changes and schedule auto-save (5 seconds debounce)
  useEffect(() => {
    hasUnsavedChanges.current = true;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSave();
    }, 5000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, sections]);

  // Save on page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges.current && form.title.length >= 3 && form.description.length >= 10 && form.category) {
        autoSave();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autoSave]);

  function buildCoursePayload() {
    return {
      title: form.title,
      description: form.description,
      subtitle: form.subtitle || undefined,
      category: form.category,
      subcategory: form.subcategory || undefined,
      level: form.level,
      language: form.language,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      thumbnail: form.thumbnail || undefined,
      previewVideo: form.previewVideo || undefined,
      learningOutcomes: form.learningOutcomes
        ? form.learningOutcomes.split("\n").filter(Boolean)
        : [],
      requirements: form.requirements
        ? form.requirements.split("\n").filter(Boolean)
        : [],
      targetAudience: form.targetAudience
        ? form.targetAudience.split("\n").filter(Boolean)
        : [],
    };
  }

  async function saveSections(cId: string) {
    for (const section of sections) {
      if (!section.title) continue;
      try {
        const sRes = await fetch(`/api/courses/${cId}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: section.title,
            description: section.description || undefined,
          }),
        });
        if (sRes.ok) {
          const sJson = await sRes.json();
          const sectionId = sJson.data?.id;
          if (sectionId) {
            for (const lesson of section.lessons) {
              if (!lesson.title) continue;
              await fetch(
                `/api/courses/${cId}/sections/${sectionId}/lessons`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: lesson.title,
                    description: lesson.description || undefined,
                    type: lesson.type,
                    videoUrl: lesson.videoUrl || undefined,
                    isFree: lesson.isFree,
                  }),
                }
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to save section:", err);
      }
    }
  }

  // ── Manual save ──
  async function handleSaveDraft() {
    if (!form.title || form.title.length < 3) {
      setErrors({ title: "Title must be at least 3 characters" });
      return;
    }
    if (!form.description || form.description.length < 10) {
      setErrors({ description: "Description must be at least 10 characters" });
      return;
    }
    if (!form.category) {
      setErrors({ category: "Category is required" });
      return;
    }
    setErrors({});
    await autoSave();
    showToast("Draft saved successfully");
  }

  // ── Publish ──
  async function handlePublish() {
    if (!form.title || form.title.length < 3) {
      setErrors({ title: "Title must be at least 3 characters" });
      return;
    }
    if (!form.description || form.description.length < 10) {
      setErrors({ description: "Description must be at least 10 characters" });
      return;
    }
    if (!form.category) {
      setErrors({ category: "Category is required" });
      return;
    }

    setErrors({});
    setPublishing(true);

    try {
      let cId = courseId;

      // Save course first if not saved yet
      if (!cId) {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildCoursePayload()),
        });
        if (res.ok) {
          const json = await res.json();
          cId = json.data?.id;
          if (cId) {
            setCourseId(cId);
            await saveSections(cId);
          }
        }
      }

      if (cId) {
        // Publish
        await fetch(`/api/courses/${cId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" }),
        });
        showToast("Course published successfully!");
        setTimeout(() => router.push("/CreatorCourses/all"), 1500);
      }
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setPublishing(false);
    }
  }

  // ── Form helpers ──
  function updateForm(field: keyof CourseForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function updateSection(idx: number, field: keyof SectionForm, value: unknown) {
    setSections((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection()]);
  }

  function removeSection(idx: number) {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLesson(
    sIdx: number,
    lIdx: number,
    field: keyof LessonForm,
    value: unknown
  ) {
    setSections((prev) => {
      const next = [...prev];
      const lessons = [...next[sIdx].lessons];
      lessons[lIdx] = { ...lessons[lIdx], [field]: value };
      next[sIdx] = { ...next[sIdx], lessons };
      return next;
    });
  }

  function addLesson(sIdx: number) {
    setSections((prev) => {
      const next = [...prev];
      next[sIdx] = {
        ...next[sIdx],
        lessons: [...next[sIdx].lessons, emptyLesson()],
      };
      return next;
    });
  }

  function removeLesson(sIdx: number, lIdx: number) {
    setSections((prev) => {
      const next = [...prev];
      next[sIdx] = {
        ...next[sIdx],
        lessons: next[sIdx].lessons.filter((_, i) => i !== lIdx),
      };
      return next;
    });
  }

  return (
    <CreatorLayout activeItem="/CreatorCourses/create">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-500 mt-1">
              Fill in the details below. Your progress is saved automatically.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </span>
            )}
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* ── Course Details ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>

          <div className="grid grid-cols-1 gap-5">
            {/* Title */}
            <Field label="Course Title" required error={errors.title}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="e.g. Complete React Developer Course"
                className="input-field"
              />
            </Field>

            {/* Subtitle */}
            <Field label="Subtitle">
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => updateForm("subtitle", e.target.value)}
                placeholder="A brief subtitle or tagline"
                className="input-field"
              />
            </Field>

            {/* Description */}
            <Field label="Description" required error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Describe what students will learn…"
                rows={4}
                className="input-field resize-none"
              />
            </Field>

            {/* Category + Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Category" required error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Level">
                <select
                  value={form.level}
                  onChange={(e) => updateForm("level", e.target.value)}
                  className="input-field"
                >
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Language + Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Language">
                <input
                  type="text"
                  value={form.language}
                  onChange={(e) => updateForm("language", e.target.value)}
                  placeholder="en"
                  className="input-field"
                />
              </Field>

              <Field label="Tags (comma separated)">
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => updateForm("tags", e.target.value)}
                  placeholder="react, javascript, web dev"
                  className="input-field"
                />
              </Field>
            </div>

            {/* Thumbnail + Preview Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FileUpload
                type="image"
                label="Course Thumbnail"
                value={form.thumbnail}
                onChange={(url) => updateForm("thumbnail", url)}
              />
              <FileUpload
                type="video"
                label="Preview Video"
                value={form.previewVideo}
                onChange={(url) => updateForm("previewVideo", url)}
              />
            </div>

            {/* Learning Outcomes */}
            <Field label="Learning Outcomes (one per line)">
              <textarea
                value={form.learningOutcomes}
                onChange={(e) => updateForm("learningOutcomes", e.target.value)}
                placeholder={"Build full-stack apps with React\nUnderstand hooks and state management\nDeploy to production"}
                rows={3}
                className="input-field resize-none"
              />
            </Field>

            {/* Requirements */}
            <Field label="Requirements (one per line)">
              <textarea
                value={form.requirements}
                onChange={(e) => updateForm("requirements", e.target.value)}
                placeholder={"Basic JavaScript knowledge\nA computer with internet"}
                rows={2}
                className="input-field resize-none"
              />
            </Field>

            {/* Target Audience */}
            <Field label="Target Audience (one per line)">
              <textarea
                value={form.targetAudience}
                onChange={(e) => updateForm("targetAudience", e.target.value)}
                placeholder={"Beginner web developers\nStudents looking to learn React"}
                rows={2}
                className="input-field resize-none"
              />
            </Field>
          </div>
        </div>

        {/* ── Seasons & Episodes ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Seasons & Episodes
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Organize your course into seasons (sections) with episodes (lessons)
              </p>
            </div>
            <button
              onClick={addSection}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Season
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, sIdx) => (
              <div
                key={sIdx}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Season header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                  <button
                    onClick={() =>
                      updateSection(sIdx, "expanded", !section.expanded)
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {section.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Season {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(sIdx, "title", e.target.value)
                    }
                    placeholder="Season title (e.g. Getting Started)"
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                  />
                  <span className="text-xs text-gray-500">
                    {section.lessons.length} ep{section.lessons.length !== 1 ? "s" : ""}
                  </span>
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(sIdx)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Episodes */}
                {section.expanded && (
                  <div className="p-4 space-y-3">
                    {/* Season description */}
                    <input
                      type="text"
                      value={section.description}
                      onChange={(e) =>
                        updateSection(sIdx, "description", e.target.value)
                      }
                      placeholder="Season description (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {section.lessons.map((lesson, lIdx) => (
                      <div
                        key={lIdx}
                        className="border border-gray-100 rounded-lg p-3 bg-white"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />
                          <span className="text-xs text-gray-400 font-medium w-8">
                            E{lIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(sIdx, lIdx, "title", e.target.value)
                            }
                            placeholder="Episode title"
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder:text-gray-400"
                          />
                          <select
                            value={lesson.type}
                            onChange={(e) =>
                              updateLesson(sIdx, lIdx, "type", e.target.value)
                            }
                            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
                          >
                            <option value="VIDEO">Video</option>
                            <option value="ARTICLE">Article</option>
                            <option value="QUIZ">Quiz</option>
                            <option value="RESOURCE">Resource</option>
                            <option value="ASSIGNMENT">Assignment</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={lesson.isFree}
                              onChange={(e) =>
                                updateLesson(
                                  sIdx,
                                  lIdx,
                                  "isFree",
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            Free
                          </label>
                          {section.lessons.length > 1 && (
                            <button
                              onClick={() => removeLesson(sIdx, lIdx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Extra fields for VIDEO type */}
                        {lesson.type === "VIDEO" && (
                          <div className="ml-10 mt-2">
                            <FileUpload
                              type="video"
                              value={lesson.videoUrl}
                              onChange={(url) =>
                                updateLesson(sIdx, lIdx, "videoUrl", url)
                              }
                            />
                          </div>
                        )}

                        {/* Description */}
                        <div className="ml-10 mt-2">
                          <input
                            type="text"
                            value={lesson.description}
                            onChange={(e) =>
                              updateLesson(
                                sIdx,
                                lIdx,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Episode description (optional)"
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addLesson(sIdx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Episode
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Actions ── */}
        <div className="flex items-center justify-between py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {courseId ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="w-3.5 h-3.5" />
                Saved as draft
              </span>
            ) : (
              "Fill in the required fields to save"
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Course
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />

      {/* Inline styles for input fields */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .input-field::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </CreatorLayout>
  );
}

// ── Field wrapper component ──
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
