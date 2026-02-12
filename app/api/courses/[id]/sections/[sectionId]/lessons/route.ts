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
// POST /api/courses/[id]/sections/[sectionId]/lessons — Add lesson
// ==========================================

const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "ARTICLE", "QUIZ", "RESOURCE", "ASSIGNMENT"]).default("VIDEO"),
  videoUrl: z.string().optional(),
  videoDuration: z.number().optional(),
  articleContent: z.string().optional(),
  resourceUrl: z.string().optional(),
  isFree: z.boolean().default(false),
  isPreview: z.boolean().default(false),
});

export const POST = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id, sectionId } = await (
      context as { params: Promise<{ id: string; sectionId: string }> }
    ).params;

    // Verify course ownership
    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    // Verify section belongs to this course
    const section = await db.section.findFirst({
      where: { id: sectionId, courseId: id },
    });
    if (!section) throw new NotFoundError("Section not found");

    const body = await req.json();
    const validated = createLessonSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        validated.error.flatten().fieldErrors as Record<string, unknown>
      );
    }

    // Get max order in this section
    const lastLesson = await db.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
    });

    const lesson = await db.lesson.create({
      data: {
        ...validated.data,
        sectionId,
        order: (lastLesson?.order ?? 0) + 1,
      },
    });

    return successResponse(lesson, "Lesson added", 201);
  }
);

// ==========================================
// GET — List lessons in a section
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const { id, sectionId } = await (
      context as { params: Promise<{ id: string; sectionId: string }> }
    ).params;

    const lessons = await db.lesson.findMany({
      where: { sectionId, section: { courseId: id } },
      orderBy: { order: "asc" },
    });

    return successResponse(lessons);
  }
);
