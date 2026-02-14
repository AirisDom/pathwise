import { db } from "@/lib/db";
import {
  successResponse,
  requireAuth,
  withErrorHandler,
} from "@/lib/api-utils";

// ==========================================
// GET /api/student/courses — Student's enrolled courses
// ==========================================

export const GET = withErrorHandler(async (req: Request) => {
  const user = await requireAuth();

  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") ?? "all"; // all | in-progress | completed
  const search = url.searchParams.get("search") ?? "";

  const whereEnrollment: Record<string, unknown> = {
    studentId: user.id,
  };

  if (filter === "in-progress") {
    whereEnrollment.isCompleted = false;
  } else if (filter === "completed") {
    whereEnrollment.isCompleted = true;
  }

  const enrollments = await db.enrollment.findMany({
    where: {
      ...whereEnrollment,
      course: search
        ? { title: { contains: search, mode: "insensitive" } }
        : undefined,
    },
    include: {
      course: {
        include: {
          creator: {
            select: { id: true, name: true, image: true },
          },
          sections: {
            include: {
              _count: { select: { lessons: true } },
            },
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

  const courses = enrollments.map((e) => {
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
      subtitle: e.course.subtitle,
      thumbnail: e.course.thumbnail,
      category: e.course.category,
      level: e.course.level,
      creator: e.course.creator,
      progress: Number(e.progress),
      totalLessons,
      completedLessons,
      isCompleted: e.isCompleted,
      lastAccessedAt: e.lastAccessedAt,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      enrollmentCount: e.course.enrollmentCount,
      averageRating: e.course.averageRating ? Number(e.course.averageRating) : null,
    };
  });

  return successResponse({
    courses,
    total: courses.length,
    filter,
  });
});
