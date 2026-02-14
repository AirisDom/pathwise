"use client";

import Link from "next/link";
import {
  Eye,
  Users,
  Star,
  PlayCircle,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  FileText,
} from "lucide-react";

export interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  level: string;
  category: string;
  viewCount: number;
  enrollmentCount: number;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  _count: {
    sections: number;
    enrollments: number;
    reviews: number;
  };
  sections?: Array<{
    _count: { lessons: number };
  }>;
}

interface CourseCardProps {
  course: CourseCardData;
  onDelete?: (id: string) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800",
    icon: <FileText className="w-3 h-3" />,
  },
  IN_REVIEW: {
    label: "In Review",
    color: "bg-orange-100 text-orange-800",
    icon: <Clock className="w-3 h-3" />,
  },
  PUBLISHED: {
    label: "Published",
    color: "bg-green-100 text-green-800",
    icon: <Globe className="w-3 h-3" />,
  },
  ARCHIVED: {
    label: "Archived",
    color: "bg-gray-100 text-gray-600",
    icon: <FileText className="w-3 h-3" />,
  },
};

export default function CourseCard({ course, onDelete }: CourseCardProps) {
  const totalLessons =
    course.sections?.reduce((sum, s) => sum + s._count.lessons, 0) ?? 0;
  const statusInfo = statusConfig[course.status] ?? statusConfig.DRAFT;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail — fixed width, stretches to full card height */}
        <Link
          href={`/CreatorCourses/${course.id}/edit`}
          className="relative w-full sm:w-56 md:w-64 lg:w-72 shrink-0"
        >
          <div className="aspect-video sm:aspect-auto sm:absolute sm:inset-0 bg-gray-100 relative overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
                <PlayCircle className="w-12 h-12 text-blue-300" />
              </div>
            )}
            {/* Status badge on thumbnail */}
            <div className="absolute top-2 left-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Pencil className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
          </div>
        </Link>

        {/* Content & Stats — overflow hidden so text never bleeds behind image */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* Title & Meta */}
          <div className="mb-3">
            <Link
              href={`/CreatorCourses/${course.id}/edit`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
            >
              {course.title}
            </Link>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500 flex-wrap">
              <span className="capitalize">{course.level.toLowerCase().replace("_", " ")}</span>
              <span>•</span>
              <span>{course.category}</span>
              <span>•</span>
              <span>{course._count.sections} season{course._count.sections !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{totalLessons} episode{totalLessons !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-4">
            <StatBlock label="Views" value={formatNumber(course.viewCount)} icon={<Eye className="w-3.5 h-3.5" />} />
            <StatBlock label="Students" value={formatNumber(course.enrollmentCount)} icon={<Users className="w-3.5 h-3.5" />} />
            <StatBlock
              label="Rating"
              value={course.averageRating ? Number(course.averageRating).toFixed(1) : "—"}
              icon={<Star className="w-3.5 h-3.5" />}
            />
            <StatBlock label="Reviews" value={formatNumber(course.reviewCount)} icon={<Star className="w-3.5 h-3.5" />} />
            <StatBlock
              label="Updated"
              value={formatDate(course.updatedAt)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <Link
              href={`/CreatorCourses/${course.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(course.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
