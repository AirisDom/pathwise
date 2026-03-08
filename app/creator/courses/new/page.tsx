"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/creator/FileUpload";
import {
  ArrowLeft,
  BookOpen,
  CaretRight,
  CircleNotch,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const CATEGORIES = [
  "Web Development",
  "Data Science",
  "Business",
  "Design",
  "Marketing",
  "Photography",
  "Music",
  "Personal Development",
  "Other",
];

// ═══════════════════════════════════════
// Dynamic list sub-component
// ═══════════════════════════════════════

function DynamicList({
  items,
  placeholder,
  onChange,
}: {
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add item
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
// Page Component
// ═══════════════════════════════════════

export default function NewCoursePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS",
    language: "en",
    thumbnail: "",
    learningOutcomes: [""],
    requirements: [""],
    targetAudience: [""],
  });

  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited) {
      const generated = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [form.title, slugManuallyEdited]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.title.trim() || form.title.length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (!form.description.trim() || form.description.length < 10)
      newErrors.description = "Description must be at least 10 characters";
    if (!form.category)
      newErrors.category = "Please select a category";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || undefined,
          description: form.description,
          category: form.category,
          level: form.level,
          language: form.language,
          thumbnail: form.thumbnail || undefined,
          learningOutcomes: form.learningOutcomes.filter(Boolean),
          requirements: form.requirements.filter(Boolean),
          targetAudience: form.targetAudience.filter(Boolean),
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        router.push(`/creator/courses/${json.data.id}/edit`);
      } else {
        if (json.error?.details) {
          setErrors(json.error.details as Record<string, string>);
        } else {
          setErrors({ general: json.error?.message || "Failed to create course" });
        }
      }
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/creator/courses"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Fill in the details below to get started
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* General error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* ── SECTION: Basic Info ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Basic Information
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Complete Python Bootcamp for Beginners"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                autoFocus
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Slug preview */}
            {slug && (
              <div className="flex items-center gap-1 text-xs text-gray-400 -mt-2">
                <CaretRight className="w-3 h-3 shrink-0" />
                <span className="shrink-0">URL: /courses/</span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    );
                  }}
                  className="flex-1 min-w-0 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-400 text-gray-600 font-mono"
                />
              </div>
            )}

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle{" "}
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setField("subtitle", e.target.value)}
                placeholder="A short, punchy description shown under the title"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe what students will learn, who it's for, and why they should take it..."
                rows={5}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* ── SECTION: Course Details ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-purple-500" />
              Course Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.category ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setField("level", e.target.value as typeof form.level)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setField("language", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="ar">Arabic</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── SECTION: Thumbnail ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Course Thumbnail
              <span className="text-gray-400 font-normal text-xs ml-2">(optional — can add later)</span>
            </h2>
            <FileUpload
              type="image"
              value={form.thumbnail}
              onChange={(url) => setField("thumbnail", url)}
              label="UploadSimple a compelling thumbnail (16:9 recommended)"
            />
          </div>

          {/* ── SECTION: Learning Outcomes ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              What Students Will Learn
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              List the key skills or knowledge students will gain
            </p>
            <DynamicList
              items={form.learningOutcomes}
              placeholder="e.g. Build real-world projects with Python"
              onChange={(items) => setField("learningOutcomes", items)}
            />
          </div>

          {/* ── SECTION: Requirements ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Requirements
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              What should students know before taking this course?
            </p>
            <DynamicList
              items={form.requirements}
              placeholder="e.g. Basic computer skills"
              onChange={(items) => setField("requirements", items)}
            />
          </div>

          {/* ── SECTION: Target Audience ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Who This Course Is For
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Describe the ideal student for this course
            </p>
            <DynamicList
              items={form.targetAudience}
              placeholder="e.g. Aspiring data scientists with no prior experience"
              onChange={(items) => setField("targetAudience", items)}
            />
          </div>

          {/* ── SUBMIT ── */}
          <div className="flex items-center justify-between pb-8">
            <Link
              href="/creator/courses"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Course &amp; Add Content
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
