import { z } from "zod";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireRole,
  withErrorHandler,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ==========================================
// PUT /api/courses/[id]/sections/[sectionId]/lessons/[lessonId] — Update lesson
// ==========================================

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "ARTICLE", "QUIZ", "RESOURCE", "ASSIGNMENT"]).optional(),
  videoUrl: z.string().optional().nullable(),
  videoDuration: z.number().optional().nullable(),
  articleContent: z.string().optional().nullable(),
  resourceUrl: z.string().optional().nullable(),
  isFree: z.boolean().optional(),
  isPreview: z.boolean().optional(),
  order: z.number().int().min(1).optional(),
});

export const PUT = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id, sectionId, lessonId } = await (
      context as {
        params: Promise<{ id: string; sectionId: string; lessonId: string }>;
      }
    ).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const lesson = await db.lesson.findFirst({
      where: { id: lessonId, sectionId, section: { courseId: id } },
    });
    if (!lesson) throw new NotFoundError("Lesson not found");

    const body = await req.json();
    const validated = updateLessonSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        validated.error.flatten().fieldErrors as Record<string, unknown>
      );
    }

    const updated = await db.lesson.update({
      where: { id: lessonId },
      data: validated.data,
    });

    return successResponse(updated, "Lesson updated");
  }
);

// ==========================================
// DELETE /api/courses/[id]/sections/[sectionId]/lessons/[lessonId] — Delete lesson
// ==========================================

export const DELETE = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id, sectionId, lessonId } = await (
      context as {
        params: Promise<{ id: string; sectionId: string; lessonId: string }>;
      }
    ).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const lesson = await db.lesson.findFirst({
      where: { id: lessonId, sectionId, section: { courseId: id } },
    });
    if (!lesson) throw new NotFoundError("Lesson not found");

    await db.lesson.delete({ where: { id: lessonId } });

    // Re-order remaining lessons
    const remaining = await db.lesson.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
    });
    for (let i = 0; i < remaining.length; i++) {
      await db.lesson.update({
        where: { id: remaining[i].id },
        data: { order: i + 1 },
      });
    }

    return successResponse(null, "Lesson deleted");
  }
);
