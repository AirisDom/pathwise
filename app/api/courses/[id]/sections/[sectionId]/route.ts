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
// PUT /api/courses/[id]/sections/[sectionId] — Update section
// ==========================================

const updateSectionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().min(1).optional(),
});

export const PUT = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id, sectionId } = await (
      context as { params: Promise<{ id: string; sectionId: string }> }
    ).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const section = await db.section.findFirst({
      where: { id: sectionId, courseId: id },
    });
    if (!section) throw new NotFoundError("Section not found");

    const body = await req.json();
    const validated = updateSectionSchema.safeParse(body);
    if (!validated.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        validated.error.flatten().fieldErrors as Record<string, unknown>
      );
    }

    const updated = await db.section.update({
      where: { id: sectionId },
      data: validated.data,
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    return successResponse(updated, "Section updated");
  }
);

// ==========================================
// DELETE /api/courses/[id]/sections/[sectionId] — Delete section
// ==========================================

export const DELETE = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id, sectionId } = await (
      context as { params: Promise<{ id: string; sectionId: string }> }
    ).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const section = await db.section.findFirst({
      where: { id: sectionId, courseId: id },
    });
    if (!section) throw new NotFoundError("Section not found");

    await db.section.delete({ where: { id: sectionId } });

    // Re-order remaining sections
    const remaining = await db.section.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
    });
    for (let i = 0; i < remaining.length; i++) {
      await db.section.update({
        where: { id: remaining[i].id },
        data: { order: i + 1 },
      });
    }

    return successResponse(null, "Section deleted");
  }
);
