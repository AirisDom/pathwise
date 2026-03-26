"use client";

import { useState, useEffect } from "react";
import CreatorLayout from "@/components/creator/CreatorLayout";
import {
  Star,
  MagnifyingGlass,
  CircleNotch,
  ChatCircleDots,
  UserCircle,
  FunnelSimple,
} from "@phosphor-icons/react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: { id: string; name: string | null; email: string; image: string | null };
  course: { id: string; title: string; thumbnail: string | null };
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= rating ? "text-amber-400" : "text-gray-200"}
          weight={i <= rating ? "fill" : "regular"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function CreatorReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState("0");
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    fetchReviews();
  }, [courseFilter, ratingFilter, sort]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (courseFilter) params.set("courseId", courseFilter);
      if (ratingFilter) params.set("rating", ratingFilter);
      params.set("sort", sort);
      const res = await fetch(`/api/creator/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setCourses(data.courses);
        setTotalReviews(data.totalReviews);
        setAvgRating(data.avgRating);
        setDistribution(data.distribution);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  const maxDistribution = Math.max(...distribution, 1);

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-500 mt-1">See what students think about your courses</p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average rating card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
            <Stars rating={Math.round(parseFloat(avgRating))} size={20} />
            <p className="text-sm text-gray-500 mt-2">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Distribution */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">Rating Distribution</p>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setRatingFilter(ratingFilter === String(star) ? "" : String(star))
                      }
                      className={`flex items-center gap-1 text-sm font-medium w-12 shrink-0 ${
                        ratingFilter === String(star) ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {star} <Star className="w-3.5 h-3.5 text-amber-400" weight="fill" />
                    </button>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <ChatCircleDots className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">
              Reviews will appear here as students rate your courses.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Student avatar */}
                  {review.student.image ? (
                    <img
                      src={review.student.image}
                      alt={review.student.name || ""}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <UserCircle className="w-6 h-6 text-blue-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {review.student.name || "Anonymous"}
                      </p>
                      <Stars rating={review.rating} size={14} />
                      <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                    </div>

                    {/* Course badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3">
                      {review.course.title}
                    </span>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
