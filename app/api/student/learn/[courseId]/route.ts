import { db } from "@/lib/db";
import {
  successResponse,
  requireAuth,
  withErrorHandler,
  NotFoundError,
} from "@/lib/api-utils";

// ==========================================
// GET /api/student/learn/[courseId] — Full course data for player
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireAuth();
    const { courseId } = await (
      context as { params: Promise<{ courseId: string }> }
    ).params;

    // Find course by id or slug
    const course = await db.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            bio: true,
            creatorProfile: {
              select: {
                headline: true,
                expertise: true,
                experienceYears: true,
                bio: true,
                totalStudents: true,
                totalCourses: true,
                averageRating: true,
              },
            },
          },
        },
        sections: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) throw new NotFoundError("Course not found");

    // Get enrollment + lesson progress
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: course.id,
        },
      },
      include: {
        lessonProgress: true,
      },
    });

    // Build a map of lessonId -> progress
    const progressMap: Record<
      string,
      { isCompleted: boolean; watchDuration: number | null }
    > = {};
    if (enrollment) {
      for (const lp of enrollment.lessonProgress) {
        progressMap[lp.lessonId] = {
          isCompleted: lp.isCompleted,
          watchDuration: lp.watchDuration,
        };
      }
    }

    // Attach progress to each lesson
    const sections = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      order: section.order,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        order: lesson.order,
        videoUrl: lesson.videoUrl,
        videoDuration: lesson.videoDuration,
        articleContent: lesson.articleContent,
        resourceUrl: lesson.resourceUrl,
        isFree: lesson.isFree,
        isPreview: lesson.isPreview,
        isCompleted: progressMap[lesson.id]?.isCompleted ?? false,
        watchDuration: progressMap[lesson.id]?.watchDuration ?? 0,
      })),
    }));

    // Compute total lessons and completed
    const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);
    const completedLessons = sections.reduce(
      (s, sec) => s + sec.lessons.filter((l) => l.isCompleted).length,
      0
    );

    // Update lastAccessedAt
    if (enrollment) {
      await db.enrollment.update({
        where: { id: enrollment.id },
        data: { lastAccessedAt: new Date() },
      });
    }

    return successResponse({
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        subtitle: course.subtitle,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        language: course.language,
        learningOutcomes: course.learningOutcomes,
        requirements: course.requirements,
        targetAudience: course.targetAudience,
        enrollmentCount: course.enrollmentCount,
        averageRating: course.averageRating,
        reviewCount: course.reviewCount,
        creator: course.creator,
      },
      sections,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            progress: Number(enrollment.progress),
            isCompleted: enrollment.isCompleted,
          }
        : null,
      totalLessons,
      completedLessons,
    });
  }
);
