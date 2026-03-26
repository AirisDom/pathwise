import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
  NotFoundError,
} from "@/lib/api-utils";

// ==========================================
// POST /api/student/enroll — Enroll in a course
// ==========================================

export const POST = withErrorHandler(async (req: Request) => {
  const user = await requireAuth();
  const body = await req.json();
  const { courseId } = body;

  if (!courseId) {
    return errorResponse("MISSING_FIELD", "courseId is required", 400);
  }

  // Check course exists and is published
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.status !== "PUBLISHED") {
    throw new NotFoundError("Course not found or not available");
  }

  // Check if already enrolled
  const existing = await db.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: user.id,
        courseId,
      },
    },
  });

  if (existing) {
    return errorResponse("ALREADY_ENROLLED", "You are already enrolled in this course", 400);
  }

  // Create enrollment
  const enrollment = await db.enrollment.create({
    data: {
      studentId: user.id,
      courseId,
      lastAccessedAt: new Date(),
    },
  });

  // Increment enrollment count on the course
  await db.course.update({
    where: { id: courseId },
    data: { enrollmentCount: { increment: 1 } },
  });

  // Notify the creator
  await db.notification.create({
    data: {
      userId: course.creatorId,
      type: "ENROLLMENT",
      title: "New Student Enrolled",
      message: `${user.name || "A student"} enrolled in "${course.title}"`,
      link: "/CreatorStudents",
    },
  });

  // Upsert analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.courseAnalytics.upsert({
    where: {
      courseId_date: {
        courseId,
        date: today,
      },
    },
    update: {
      enrollments: { increment: 1 },
    },
    create: {
      courseId,
      date: today,
      enrollments: 1,
    },
  });

  return successResponse({ enrollmentId: enrollment.id }, "Successfully enrolled!", 201);
});
