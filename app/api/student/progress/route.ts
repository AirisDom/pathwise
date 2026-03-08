import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
  NotFoundError,
} from "@/lib/api-utils";

// ==========================================
// POST /api/student/progress — Mark lesson complete / update watch time
// ==========================================

export const POST = withErrorHandler(async (req: Request) => {
  const user = await requireAuth();
  const body = await req.json();
  const { courseId, lessonId, isCompleted, watchDuration } = body;

  if (!courseId || !lessonId) {
    return errorResponse("MISSING_FIELD", "courseId and lessonId are required", 400);
  }

  // Find enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: user.id,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new NotFoundError("You are not enrolled in this course");
  }

  // Upsert lesson progress
  await db.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    update: {
      ...(isCompleted !== undefined && {
        isCompleted,
        ...(isCompleted && { completedAt: new Date() }),
      }),
      ...(watchDuration !== undefined && { watchDuration }),
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId,
      isCompleted: isCompleted ?? false,
      ...(isCompleted && { completedAt: new Date() }),
      watchDuration: watchDuration ?? 0,
    },
  });

  // Recalculate overall course progress
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        include: {
          lessons: { select: { id: true } },
        },
      },
    },
  });

  if (course) {
    const totalLessons = course.sections.reduce(
      (s, sec) => s + sec.lessons.length,
      0
    );

    const completedCount = await db.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
    });

    const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    const courseCompleted = completedCount >= totalLessons && totalLessons > 0;

    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        isCompleted: courseCompleted,
        ...(courseCompleted && !enrollment.completedAt && { completedAt: new Date() }),
        lastAccessedAt: new Date(),
      },
    });

    return successResponse({
      progress,
      completedLessons: completedCount,
      totalLessons,
      courseCompleted,
    });
  }

  return successResponse({ message: "Progress updated" });
});
