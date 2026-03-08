import { db } from "@/lib/db";
import { successResponse, withErrorHandler } from "@/lib/api-utils";

// ==========================================
// GET /api/courses/featured — Featured courses for the homepage
// ==========================================

export const GET = withErrorHandler(async () => {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      thumbnail: true,
      category: true,
      level: true,
      enrollmentCount: true,
      averageRating: true,
      reviewCount: true,
      creator: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { sections: true, enrollments: true },
      },
    },
    orderBy: [
      { enrollmentCount: "desc" },
      { averageRating: "desc" },
    ],
    take: 8,
  });

  return successResponse(courses);
});
