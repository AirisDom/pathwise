"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Loader2,
  MessageSquare,
  ThumbsUp,
  User,
  Send,
  Edit3,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: { id: string; name: string | null; image: string | null };
}

interface ReviewsProps {
  courseId: string;
  isEnrolled: boolean;
}

export default function CourseReviews({ courseId, isEnrolled }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [distribution, setDistribution] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [userReview, setUserReview] = useState<{
    id: string;
    rating: number;
    comment: string | null;
  } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews?limit=50`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data.data);
        setDistribution(json.data.distribution);
        setAverageRating(json.data.averageRating);
        setReviewCount(json.data.reviewCount);
        if (json.data.userReview) {
          setUserReview(json.data.userReview);
          setRating(json.data.userReview.rating);
          setComment(json.data.userReview.comment ?? "");
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (rating < 1) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const totalForDist = Object.values(distribution).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Rating Summary ── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Student Reviews
        </h3>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Average */}
          <div className="text-center sm:text-left shrink-0">
            <div className="text-5xl font-bold text-white">
              {averageRating ? Number(averageRating).toFixed(1) : "—"}
            </div>
            <div className="flex items-center gap-1 justify-center sm:justify-start mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(averageRating ?? 0))
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {reviewCount} review{reviewCount !== 1 && "s"}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] ?? 0;
              const pct = totalForDist > 0 ? (count / totalForDist) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 justify-end">
                    <span className="text-xs text-gray-400">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write/Edit review button */}
        {isEnrolled && (
          <div className="mt-5 pt-5 border-t border-gray-800">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                {userReview ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Your Review
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Write a Review
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Star picker */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            s <= (hoverRating || rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-sm text-gray-400 ml-2">
                        {
                          ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                            rating
                          ]
                        }
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Your Review (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this course..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={3}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {comment.length}/2000 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={submitReview}
                    disabled={rating < 1 || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {userReview ? "Update Review" : "Submit Review"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Individual Reviews ── */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {review.student.image ? (
                    <img
                      src={review.student.image}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {review.student.name ?? "Student"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No reviews yet.</p>
          {isEnrolled && (
            <p className="text-xs text-gray-600 mt-1">
              Be the first to review this course!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
