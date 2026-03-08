"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Star,
  User,
} from "lucide-react";

interface ReviewData {
  courseId: string;
  courseTitle: string;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    student: { id: string; name: string | null; image: string | null };
  }[];
}

export default function CreatorFeedbackPage() {
  const { status } = useSession();
  const [reviewData, setReviewData] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchFeedback();
  }, [status]);

  async function fetchFeedback() {
    try {
      const res = await fetch("/api/creator/courses?limit=100");
      if (!res.ok) return;
      const json = await res.json();
      const courses: { id: string; title: string }[] = (json.data?.data ?? json.data ?? []);

      const allReviews: ReviewData[] = [];
      for (const course of courses.slice(0, 20)) {
        try {
          const r = await fetch(`/api/courses/${course.id}/reviews?limit=50`);
          if (r.ok) {
            const rJson = await r.json();
            if (rJson.data?.data?.length > 0) {
              allReviews.push({
                courseId: course.id,
                courseTitle: course.title,
                reviews: rJson.data.data,
              });
            }
          }
        } catch {
          // skip
        }
      }

      setReviewData(allReviews);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  }

  const allReviews = reviewData.flatMap((rd) =>
    rd.reviews.map((r) => ({ ...r, courseTitle: rd.courseTitle }))
  );
  allReviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/CreatorDashboard"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Feedback &amp; Reviews</h1>
              <p className="text-xs text-gray-500">
                {allReviews.length} review{allReviews.length !== 1 && "s"} across your courses
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {allReviews.length > 0 ? (
          <div className="space-y-4">
            {allReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    {review.student.image ? (
                      <img
                        src={review.student.image}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {review.student.name ?? "Student"}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
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
                    <p className="text-xs text-emerald-600 font-medium mb-2">
                      {review.courseTitle}
                    </p>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
            <p className="text-sm text-gray-500">
              Reviews from your students will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
