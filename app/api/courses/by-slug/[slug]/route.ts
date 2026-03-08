import { db } from "@/lib/db";
import {
  successResponse,
  withErrorHandler,
  NotFoundError,
} from "@/lib/api-utils";
import { auth } from "@/lib/auth";

// ==========================================
// GET /api/courses/by-slug/[slug] — Public course detail
// ==========================================

export const GET = withErrorHandler(
  async (req: Request, context: unknown) => {
    const { slug } = await (
      context as { params: Promise<{ slug: string }> }
    ).params;

    const course = await db.course.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
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
          select: {
            id: true,
            title: true,
            order: true,
            _count: { select: { lessons: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            sections: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) throw new NotFoundError("Course not found");

    // Check if current user is enrolled
    let isEnrolled = false;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const enrollment = await db.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: session.user.id,
              courseId: course.id,
            },
          },
        });
        isEnrolled = !!enrollment;
      }
    } catch {
      // Not logged in — that's fine
    }

    return successResponse({
      course,
      isEnrolled,
    });
  }
);
