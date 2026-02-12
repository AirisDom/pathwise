import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireRole,
  parsePagination,
  paginatedResponse,
  withErrorHandler,
} from "@/lib/api-utils";

// ==========================================
// GET /api/courses — List published courses
// ==========================================

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url);

  // Filters
  const category = url.searchParams.get("category");
  const level = url.searchParams.get("level");
  const search = url.searchParams.get("search");

  const where = {
    status: "PUBLISHED" as const,
    ...(category && { category }),
    ...(level && { level: level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS" }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { sections: true, enrollments: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.course.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    ...paginatedResponse(courses, total, page, limit),
  });
});

// ==========================================
// POST /api/courses — Create a new course
// ==========================================

const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  subtitle: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("BEGINNER"),
  language: z.string().default("en"),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  previewVideo: z.string().optional(),
  learningOutcomes: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
});

export const POST = withErrorHandler(async (req: Request) => {
  const user = await requireRole("CREATOR", "ADMIN");

  const body = await req.json();
  const validated = createCourseSchema.safeParse(body);

  if (!validated.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid input",
      400,
      validated.error.flatten().fieldErrors as Record<string, unknown>
    );
  }

  const { title, ...rest } = validated.data;

  // Generate a unique slug from the title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Ensure slug uniqueness
  let slug = baseSlug;
  let suffix = 1;
  while (await db.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const course = await db.course.create({
    data: {
      title,
      slug,
      ...rest,
      creatorId: user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return successResponse(course, "Course created successfully", 201);
});
