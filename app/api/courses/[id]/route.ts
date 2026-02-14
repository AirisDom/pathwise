import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireRole,
  getCurrentUser,
  withErrorHandler,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ==========================================
// GET /api/courses/[id] — Get course details
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const { id } = (context as { params: Promise<{ id: string }> }).params
      ? await (context as { params: Promise<{ id: string }> }).params
      : { id: "" };

    // Try to find by slug first, then by id
    const course = await db.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
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
                totalStudents: true,
                totalCourses: true,
                averageRating: true,
                isVerified: true,
              },
            },
          },
        },
        sections: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                order: true,
                videoUrl: true,
                videoDuration: true,
                isFree: true,
                isPreview: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Only increment view count if the viewer is NOT the course creator
    const currentUser = await getCurrentUser();
    const isCreator = currentUser?.id === course.creatorId;

    if (!isCreator) {
      // Increment the total view counter on the course
      await db.course.update({
        where: { id: course.id },
        data: { viewCount: { increment: 1 } },
      });

      // Upsert today's CourseAnalytics row so the views graph has data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await db.courseAnalytics.upsert({
        where: {
          courseId_date: {
            courseId: course.id,
            date: today,
          },
        },
        update: {
          views: { increment: 1 },
        },
        create: {
          courseId: course.id,
          date: today,
          views: 1,
        },
      });
    }

    return successResponse(course);
  }
);

// ==========================================
// PATCH /api/courses/[id] — Update course
// ==========================================

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  previewVideo: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const PATCH = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");

    // Only the creator or an admin can update
    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const body = await req.json();
    const validated = updateCourseSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        400,
        validated.error.flatten().fieldErrors as Record<string, unknown>
      );
    }

    const data = validated.data;

    // If publishing, set publishedAt
    if (data.status === "PUBLISHED" && course.status !== "PUBLISHED") {
      (data as Record<string, unknown>).publishedAt = new Date();
    }

    const updated = await db.course.update({
      where: { id },
      data,
    });

    return successResponse(updated, "Course updated successfully");
  }
);

// ==========================================
// DELETE /api/courses/[id] — Delete course
// ==========================================

export const DELETE = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireRole("CREATOR", "ADMIN");
    const { id } = await (context as { params: Promise<{ id: string }> }).params;

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");

    if (course.creatorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only delete your own courses");
    }

    await db.course.delete({ where: { id } });

    return successResponse(null, "Course deleted successfully");
  }
);
