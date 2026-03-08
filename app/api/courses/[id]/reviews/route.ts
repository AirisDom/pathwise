import { z } from "zod";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
  NotFoundError,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-utils";

// ==========================================
// GET /api/courses/[id]/reviews — List reviews for a course
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const { id } = await (context as { params: Promise<{ id: string }> }).params;
    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url);

    const course = await db.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { courseId: id, isApproved: true },
        include: {
          student: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.review.count({ where: { courseId: id, isApproved: true } }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await db.review.groupBy({
      by: ["rating"],
      where: { courseId: id, isApproved: true },
      _count: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r.rating] = r._count.rating;
    });

    // Get current user's review if logged in
    let userReview = null;
    try {
      const user = await requireAuth();
      userReview = await db.review.findUnique({
        where: {
          studentId_courseId: {
            studentId: user.id,
            courseId: id,
          },
        },
      });
    } catch {
      // Not logged in — that's fine
    }

    return successResponse({
      ...paginatedResponse(reviews, total, page, limit),
      distribution,
      averageRating: course.averageRating,
      reviewCount: course.reviewCount,
      userReview,
    });
  }
);

// ==========================================
// POST /api/courses/[id]/reviews — Create or update a review
// ==========================================

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const POST = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireAuth();
    const { id } = await (context as { params: Promise<{ id: string }> }).params;
    const body = await req.json();
    const { rating, comment } = reviewSchema.parse(body);

    // Check enrollment
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: id,
        },
      },
    });

    if (!enrollment) {
      return errorResponse(
        "NOT_ENROLLED",
        "You must be enrolled in this course to leave a review",
        403
      );
    }

    // Upsert review
    const review = await db.review.upsert({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: id,
        },
      },
      update: { rating, comment },
      create: {
        studentId: user.id,
        courseId: id,
        rating,
        comment,
      },
    });

    // Recalculate course average rating and count
    const agg = await db.review.aggregate({
      where: { courseId: id, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await db.course.update({
      where: { id },
      data: {
        averageRating: agg._avg.rating ?? null,
        reviewCount: agg._count.rating,
      },
    });

    return successResponse(review, "Review submitted successfully!", 201);
  }
);
