"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  MessageSquare,
  PlayCircle,
  Star,
  Users,
  Zap,
  Globe,
  Award,
  BarChart3,
  Target,
  ChevronRight,
  User,
} from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
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
  sections: {
    id: string;
    title: string;
    order: number;
    _count: { lessons: number };
  }[];
  _count: { sections: number; enrollments: number; reviews: number };
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/courses/by-slug/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setCourse(json.data.course);
        setIsEnrolled(json.data.isEnrolled);
      }
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!course) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
      });
      if (res.ok) {
        setIsEnrolled(true);
        router.push(`/courses/${slug}/learn`);
      }
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setEnrolling(false);
    }
  }

  const totalLessons =
    course?.sections?.reduce((s, sec) => s + sec._count.lessons, 0) ?? 0;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
          <p className="text-gray-500 mb-6">
            This course doesn&apos;t exist or isn&apos;t available.
          </p>
          <Link
            href="/StudentBrowse"
            className="text-emerald-600 hover:underline font-medium"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const creatorProfile = course.creator.creatorProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/StudentBrowse"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-700 px-2.5 py-1 rounded-full">
                  {course.level.replace("_", " ")}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-lg text-gray-300 mb-4">{course.subtitle}</p>
              )}

              <p className="text-gray-400 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {course.averageRating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-semibold">
                      {Number(course.averageRating).toFixed(1)}
                    </span>
                    <span>({course.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course.enrollmentCount.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {course._count.sections} sections, {totalLessons} lessons
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  {course.language === "en" ? "English" : course.language}
                </div>
              </div>

              {/* Creator line */}
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                  {course.creator.image ? (
                    <img
                      src={course.creator.image}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (course.creator.name ?? "C")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {course.creator.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {course.creator.title ??
                      creatorProfile?.headline ??
                      "Course Creator"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right — CTA Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-gray-900 sticky top-8">
                {/* Thumbnail */}
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-5">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-100 to-teal-100">
                      <PlayCircle className="w-12 h-12 text-emerald-300" />
                    </div>
                  )}
                </div>

                {/* CTA */}
                {isEnrolled ? (
                  <Link
                    href={`/courses/${slug}/learn`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg disabled:opacity-50"
                  >
                    {enrolling ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    Enroll Free
                  </button>
                )}

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span>
                      {course._count.sections} sections • {totalLessons} lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span>{course.level.replace("_", " ")} level</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Learn at your own pace</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* Learning Outcomes */}
            {course.learningOutcomes.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  What You&apos;ll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Course Content
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                {course._count.sections} sections • {totalLessons} lessons
              </p>
              <div className="space-y-2">
                {course.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        Section {section.order}: {section.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {section._count.lessons} lesson
                      {section._count.lessons !== 1 && "s"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {course.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {course.requirements.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Audience */}
            {course.targetAudience.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Who This Course Is For
                </h2>
                <ul className="space-y-2">
                  {course.targetAudience.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Creator / Instructor */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About the Instructor
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {course.creator.image ? (
                      <img
                        src={course.creator.image}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (course.creator.name ?? "C")[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.creator.name}
                    </h3>
                    <p className="text-sm text-emerald-600 font-medium">
                      {course.creator.title ??
                        creatorProfile?.headline ??
                        "Course Creator"}
                    </p>

                    {creatorProfile && (
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {creatorProfile.totalStudents > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {creatorProfile.totalStudents.toLocaleString()}{" "}
                            students
                          </div>
                        )}
                        {creatorProfile.totalCourses > 0 && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {creatorProfile.totalCourses} courses
                          </div>
                        )}
                        {creatorProfile.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400" />
                            {Number(creatorProfile.averageRating).toFixed(1)}{" "}
                            rating
                          </div>
                        )}
                        {creatorProfile.experienceYears && (
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {creatorProfile.experienceYears}+ years experience
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      {creatorProfile?.bio ??
                        course.creator.bio ??
                        "Passionate educator dedicated to helping you succeed."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <CourseDetailReviews courseId={course.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Reviews Section for Course Detail Page
// ═══════════════════════════════════════════

function CourseDetailReviews({ courseId }: { courseId: string }) {
  const [reviews, setReviews] = useState<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    student: { id: string; name: string | null; image: string | null };
  }[]>([]);
  const [distribution, setDistribution] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  });
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews?limit=10`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data.data);
        setDistribution(json.data.distribution);
        setAverageRating(json.data.averageRating);
        setReviewCount(json.data.reviewCount);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalForDist = Object.values(distribution).reduce((a, b) => a + b, 0);

  if (loading) return null;
  if (reviewCount === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        Student Reviews
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Average */}
          <div className="text-center sm:text-left shrink-0">
            <div className="text-4xl font-bold text-gray-900">
              {averageRating ? Number(averageRating).toFixed(1) : "—"}
            </div>
            <div className="flex items-center gap-0.5 justify-center sm:justify-start mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(averageRating ?? 0))
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {reviewCount} review{reviewCount !== 1 && "s"}
            </p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] ?? 0;
              const pct = totalForDist > 0 ? (count / totalForDist) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-10 justify-end">
                    <span className="text-xs text-gray-500">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm shrink-0">
                {review.student.image ? (
                  <img
                    src={review.student.image}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {review.student.name ?? "Student"}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
