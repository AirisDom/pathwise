import { db } from "@/lib/db";
import {
  successResponse,
  requireRole,
  withErrorHandler,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-utils";

// ==========================================
// GET /api/creator/courses — List this creator's courses
// ==========================================

export const GET = withErrorHandler(async (req: Request) => {
  const user = await requireRole("CREATOR", "ADMIN");

  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url);

  const statusFilter = url.searchParams.get("status"); // DRAFT | PUBLISHED | etc.
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {
    creatorId: user.id,
    ...(statusFilter && { status: statusFilter }),
    ...(search && {
      title: { contains: search, mode: "insensitive" },
    }),
  };

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      include: {
        sections: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
        _count: {
          select: { enrollments: true, reviews: true, sections: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    db.course.count({ where }),
  ]);

  return successResponse(
    paginatedResponse(courses, total, page, limit)
  );
});
