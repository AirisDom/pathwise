import { z } from "zod";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
  NotFoundError,
} from "@/lib/api-utils";

// ==========================================
// POST /api/courses/[id]/enroll — Enroll in course (free)
// ==========================================

export const POST = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireAuth();
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    // Check course exists and is published
    const course = await db.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });

    if (!course || course.status !== "PUBLISHED") {
      throw new NotFoundError("Course not found or not available");
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: id,
        },
      },
    });

    if (existing) {
      return errorResponse(
        "ALREADY_ENROLLED",
        "You are already enrolled in this course",
        409
      );
    }

    // Count total lessons
    const totalLessons = course.sections.reduce(
      (sum, section) => sum + section.lessons.length,
      0
    );

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        studentId: user.id,
        courseId: id,
        lastAccessedAt: new Date(),
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnail: true },
        },
      },
    });

    // Increment enrollment count on the course
    await db.course.update({
      where: { id },
      data: { enrollmentCount: { increment: 1 } },
    });

    return successResponse(enrollment, "Enrolled successfully!", 201);
  }
);
