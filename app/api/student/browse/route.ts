import { db } from "@/lib/db";
import {
  successResponse,
  withErrorHandler,
} from "@/lib/api-utils";

// ==========================================
// GET /api/student/browse — Browse all published courses
// ==========================================

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const search = url.searchParams.get("q") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const level = url.searchParams.get("level") ?? "";
  const sort = url.searchParams.get("sort") ?? "popular"; // popular | newest | rating

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (level) {
    where.level = level;
  }

  let orderBy: Record<string, string> = { enrollmentCount: "desc" };
  if (sort === "newest") orderBy = { publishedAt: "desc" };
  if (sort === "rating") orderBy = { averageRating: "desc" };

  const courses = await db.course.findMany({
    where,
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      sections: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
    orderBy,
    take: 50,
  });

  // Get distinct categories for filter
  const categories = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"],
  });

  const result = courses.map((c) => {
    const totalLessons = c.sections.reduce(
      (sum, s) => sum + s._count.lessons,
      0
    );

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      thumbnail: c.thumbnail,
      category: c.category,
      level: c.level,
      creator: c.creator,
      enrollmentCount: c.enrollmentCount,
      averageRating: c.averageRating ? Number(c.averageRating) : null,
      reviewCount: c.reviewCount,
      totalLessons,
      tags: c.tags,
      publishedAt: c.publishedAt,
    };
  });

  return successResponse({
    courses: result,
    categories: categories.map((c) => c.category),
    total: result.length,
  });
});
