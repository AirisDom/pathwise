import { db } from "@/lib/db";
import {
  successResponse,
  requireRole,
  withErrorHandler,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ==========================================
// GET /api/creator/courses/[courseId]/students — List enrolled students
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR");
    const { courseId } = await (context as { params: Promise<{ courseId: string }> }).params;

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { creatorId: true },
    });

    if (!course) throw new NotFoundError("Course not found");
    if (course.creatorId !== user.id) throw new ForbiddenError("Not your course");

    const enrollments = await db.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: { id: true, name: true, email: true, image: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return successResponse(enrollments);
  }
);
