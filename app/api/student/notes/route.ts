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
// GET /api/student/notes?courseId=xxx — Get all notes for a course
// ==========================================

export const GET = withErrorHandler(async (req: Request) => {
  const user = await requireAuth();
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const lessonId = url.searchParams.get("lessonId");

  if (!courseId) {
    return errorResponse("MISSING_PARAM", "courseId is required", 400);
  }

  const where: Record<string, unknown> = { userId: user.id };

  if (lessonId) {
    where.lessonId = lessonId;
  } else {
    // Get all notes for lessons in this course
    where.lesson = {
      section: { courseId },
    };
  }

  const notes = await db.note.findMany({
    where,
    include: {
      lesson: {
        select: { id: true, title: true, order: true, section: { select: { title: true, order: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(notes);
});

// ==========================================
// POST /api/student/notes — Create a note
// ==========================================

const noteSchema = z.object({
  lessonId: z.string(),
  content: z.string().min(1).max(5000),
  timestamp: z.number().int().min(0).optional().nullable(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const user = await requireAuth();
  const body = await req.json();
  const { lessonId, content, timestamp } = noteSchema.parse(body);

  // Check lesson exists
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } },
  });

  if (!lesson) throw new NotFoundError("Lesson not found");

  // Check enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: user.id,
        courseId: lesson.section.courseId,
      },
    },
  });

  if (!enrollment) {
    return errorResponse(
      "NOT_ENROLLED",
      "You must be enrolled to take notes",
      403
    );
  }

  const note = await db.note.create({
    data: {
      userId: user.id,
      lessonId,
      content,
      timestamp: timestamp ?? null,
    },
  });

  return successResponse(note, "Note saved!", 201);
});
