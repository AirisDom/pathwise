"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Check,
  PlayCircle,
  Trash2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  X,
  AlertCircle,
  Eye,
  Users,
  Star,
  Globe,
  FileText,
  Layers,
} from "lucide-react";
import Link from "next/link";
import FileUpload from "@/components/creator/FileUpload";

interface CourseData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  previewVideo: string | null;
  language: string;
  level: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  status: string;
  viewCount: number;
  enrollmentCount: number;
  averageRating: number | null;
  reviewCount: number;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
  sections: SectionData[];
}

interface SectionData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonData[];
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  videoUrl: string | null;
  videoDuration: number | null;
  isFree: boolean;
  isPreview: boolean;
}
const CATEGORIES = [
  "Web Development", "Mobile Development", "Data Science", "Machine Learning",
  "Cloud Computing", "DevOps", "Cybersecurity", "UI/UX Design", "Game Development",
  "Blockchain", "Other",
];

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All Levels" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  IN_REVIEW: { label: "In Review", color: "bg-orange-100 text-orange-800" },
  PUBLISHED: { label: "Published", color: "bg-green-100 text-green-800" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-600" },
};

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });

  // Editable fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [language, setLanguage] = useState("en");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetchCourse();
  }, [authStatus, id]);

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/courses/${id}`);
      if (res.ok) {
        const json = await res.json();
        const c = json.data as CourseData;
        setCourse(c);
        setTitle(c.title);
        setSubtitle(c.subtitle ?? "");
        setDescription(c.description);
        setCategory(c.category);
        setLevel(c.level);
        setLanguage(c.language);
        setTags(c.tags?.join(", ") ?? "");
        setThumbnail(c.thumbnail ?? "");
        setPreviewVideo(c.previewVideo ?? "");
        setLearningOutcomes(c.learningOutcomes?.join("\n") ?? "");
        setRequirements(c.requirements?.join("\n") ?? "");
        setTargetAudience(c.targetAudience?.join("\n") ?? "");
      }
    } catch (err) {
      console.error("Failed to fetch course:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle: subtitle || undefined,
          description,
          category,
          level,
          language,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          thumbnail: thumbnail || undefined,
          previewVideo: previewVideo || undefined,
          learningOutcomes: learningOutcomes ? learningOutcomes.split("\n").filter(Boolean) : [],
          requirements: requirements ? requirements.split("\n").filter(Boolean) : [],
          targetAudience: targetAudience ? targetAudience.split("\n").filter(Boolean) : [],
        }),
      });
      if (res.ok) {
        showToast("Course saved successfully");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      await handleSave();
      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (res.ok) {
        showToast("Course published!");
        setTimeout(() => router.push("/CreatorCourses/all"), 1500);
      }
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CreatorLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Loading course…</span>
        </div>
      </CreatorLayout>
    );
  }

  if (!course) {
    return (
      <CreatorLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900">Course not found</h2>
          <Link href="/CreatorCourses/all" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to All Courses
          </Link>
        </div>
      </CreatorLayout>
    );
  }

  const statusInfo = statusConfig[course.status] ?? statusConfig.DRAFT;

  return (
    <CreatorLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/CreatorCourses/all"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            {course.status !== "PUBLISHED" && (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Preview / Stats Row */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            {/* Thumbnail / Preview video */}
            <div className="md:w-72 shrink-0">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {previewVideo ? (
                  <video
                    src={previewVideo}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : thumbnail ? (
                  <img src={thumbnail} alt={title || course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
                    <PlayCircle className="w-12 h-12 text-blue-300" />
                  </div>
                )}
              </div>
            </div>
            {/* Quick stats */}
            <div className="flex-1 p-5 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{course.title}</h3>
              <div className="flex items-center gap-8 flex-wrap">
                <QuickStat icon={<Eye className="w-4 h-4" />} label="Views" value={course.viewCount.toLocaleString()} />
                <QuickStat icon={<Users className="w-4 h-4" />} label="Students" value={course.enrollmentCount.toLocaleString()} />
                <QuickStat
                  icon={<Star className="w-4 h-4" />}
                  label="Rating"
                  value={course.averageRating ? Number(course.averageRating).toFixed(1) : "—"}
                />
                <QuickStat icon={<Star className="w-4 h-4" />} label="Reviews" value={course.reviewCount.toLocaleString()} />
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {course.sections?.length ?? 0} season{(course.sections?.length ?? 0) !== 1 ? "s" : ""} •{" "}
                {course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) ?? 0} episodes
              </div>
            </div>
          </div>
        </div>

        {/* ── Editable Fields ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
          <div className="grid grid-cols-1 gap-5">
            <FieldRow label="Title">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
            </FieldRow>
            <FieldRow label="Subtitle">
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="input-field" />
            </FieldRow>
            <FieldRow label="Description">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input-field resize-none" />
            </FieldRow>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Level">
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </FieldRow>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Language">
                <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field" />
              </FieldRow>
              <FieldRow label="Tags (comma separated)">
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input-field" />
              </FieldRow>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FileUpload
                type="image"
                label="Course Thumbnail"
                value={thumbnail}
                onChange={(url) => setThumbnail(url)}
              />
              <FileUpload
                type="video"
                label="Preview Video"
                value={previewVideo}
                onChange={(url) => setPreviewVideo(url)}
              />
            </div>
            <FieldRow label="Learning Outcomes (one per line)">
              <textarea value={learningOutcomes} onChange={(e) => setLearningOutcomes(e.target.value)} rows={3} className="input-field resize-none" />
            </FieldRow>
            <FieldRow label="Requirements (one per line)">
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={2} className="input-field resize-none" />
            </FieldRow>
            <FieldRow label="Target Audience (one per line)">
              <textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2} className="input-field resize-none" />
            </FieldRow>
          </div>
        </div>

        {/* ── Seasons & Episodes ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Seasons & Episodes</h2>
            <Link
              href={`/creator/courses/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Manage Content
            </Link>
          </div>
          {course.sections && course.sections.length > 0 ? (
            <div className="space-y-3">
              {course.sections.map((section, sIdx) => (
                <SectionBlock key={section.id} section={section} index={sIdx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">No content yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Add seasons and episodes to start building your course
              </p>
              <Link
                href={`/creator/courses/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Content
              </Link>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-end gap-3 py-6 border-t border-gray-200">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          {course.status !== "PUBLISHED" && (
            <button onClick={handlePublish} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              <Send className="w-4 h-4" />
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}>
        <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>

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
      `}</style>
    </CreatorLayout>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 flex items-center gap-1">{icon}{label}</span>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SectionBlock({ section, index }: { section: SectionData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 text-left hover:bg-gray-100 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Season {index + 1}</span>
        <span className="text-sm font-medium text-gray-900 flex-1">{section.title}</span>
        <span className="text-xs text-gray-500">{section.lessons.length} ep{section.lessons.length !== 1 ? "s" : ""}</span>
      </button>
      {expanded && (
        <div className="p-3 space-y-3">
          {section.lessons.map((lesson, lIdx) => (
            <div key={lesson.id} className="rounded-lg bg-white border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span className="text-xs text-gray-400 font-medium w-6">E{lIdx + 1}</span>
                <span className="text-sm font-medium text-gray-900 flex-1">{lesson.title}</span>
                <span className="text-xs text-gray-500 capitalize">{lesson.type.toLowerCase()}</span>
                {lesson.isFree && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Free</span>}
              </div>
              {lesson.description && (
                <p className="px-3 pb-2 text-xs text-gray-500 ml-9">{lesson.description}</p>
              )}
              {lesson.videoUrl && (
                <div className="px-3 pb-3 ml-9">
                  <video
                    src={lesson.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full max-w-md rounded-lg border border-gray-200 bg-black"
                    style={{ aspectRatio: "16/9" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
