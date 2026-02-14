import { db } from "@/lib/db";
import {
  successResponse,
  requireAuth,
  withErrorHandler,
} from "@/lib/api-utils";

// ==========================================
// GET /api/student/dashboard — Student dashboard data
// ==========================================

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  // Fetch all enrollments with course info and progress
  const enrollments = await db.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          sections: {
            include: {
              _count: { select: { lessons: true } },
            },
            orderBy: { order: "asc" },
          },
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
      },
      lessonProgress: true,
    },
    orderBy: { lastAccessedAt: "desc" },
  });

  // Separate in-progress and completed
  const inProgress = enrollments.filter((e) => !e.isCompleted);
  const completed = enrollments.filter((e) => e.isCompleted);

  // Total lessons completed
  const totalLessonsCompleted = enrollments.reduce(
    (sum, e) => sum + e.lessonProgress.filter((lp) => lp.isCompleted).length,
    0
  );

  // Total time spent (from watch durations)
  const totalWatchSeconds = enrollments.reduce(
    (sum, e) =>
      sum +
      e.lessonProgress.reduce((s, lp) => s + (lp.watchDuration ?? 0), 0),
    0
  );

  // Recently accessed (top 4)
  const recentCourses = inProgress.slice(0, 4).map((e) => {
    const totalLessons = e.course.sections.reduce(
      (sum, s) => sum + s._count.lessons,
      0
    );
    const completedLessons = e.lessonProgress.filter((lp) => lp.isCompleted).length;

    return {
      enrollmentId: e.id,
      courseId: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      thumbnail: e.course.thumbnail,
      category: e.course.category,
      level: e.course.level,
      creator: e.course.creator,
      progress: Number(e.progress),
      totalLessons,
      completedLessons,
      lastAccessedAt: e.lastAccessedAt,
      enrolledAt: e.enrolledAt,
    };
  });

  // Stats
  const stats = {
    totalEnrolled: enrollments.length,
    inProgress: inProgress.length,
    completed: completed.length,
    totalLessonsCompleted,
    totalHoursLearned: Math.round(totalWatchSeconds / 3600),
    currentStreak: 0, // Future: calculate from daily activity
    longestStreak: 0,
  };

  // Recommended courses (not enrolled, published, limit 6)
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const recommended = await db.course.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : ["_none_"] },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
    orderBy: { enrollmentCount: "desc" },
    take: 6,
  });

  return successResponse({
    stats,
    recentCourses,
    completedCourses: completed.slice(0, 4).map((e) => ({
      enrollmentId: e.id,
      courseId: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      thumbnail: e.course.thumbnail,
      category: e.course.category,
      creator: e.course.creator,
      completedAt: e.completedAt,
    })),
    recommended: recommended.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      thumbnail: c.thumbnail,
      category: c.category,
      level: c.level,
      creator: c.creator,
      enrollmentCount: c.enrollmentCount,
      averageRating: c.averageRating ? Number(c.averageRating) : null,
      reviewCount: c.reviewCount,
    })),
  });
});
