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
// POST /api/courses/[id]/sections — Add section to course
// ==========================================

const createSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export const POST = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const body = await req.json();
    const validated = createSectionSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        validated.error.flatten().fieldErrors as Record<string, unknown>
      );
    }

    // Get current max order
    const lastSection = await db.section.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
    });

    const section = await db.section.create({
      data: {
        ...validated.data,
        courseId: id,
        order: (lastSection?.order ?? 0) + 1,
      },
    });

    return successResponse(section, "Section created", 201);
  }
);

// ==========================================
// GET /api/courses/[id]/sections — Get course sections + lessons
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const sections = await db.section.findMany({
      where: { courseId: id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return successResponse(sections);
  }
);
