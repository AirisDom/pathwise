import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden: Creator role required" }, { status: 403 });
    }

    const creatorId = session.user.id;

    // ── 1. Total Students ──
    // Count unique students enrolled in any of this creator's courses
    const totalStudentsResult = await db.enrollment.findMany({
      where: {
        course: { creatorId },
      },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    const totalStudents = totalStudentsResult.length;

    // ── 2. Active Courses ──
    // Count courses with status PUBLISHED
    const activeCourses = await db.course.count({
      where: {
        creatorId,
        status: "PUBLISHED",
      },
    });

    // ── 3. Total Views ──
    // Sum viewCount from all of this creator's courses
    const viewsAgg = await db.course.aggregate({
      where: { creatorId },
      _sum: { viewCount: true },
    });
    const totalViews = viewsAgg._sum.viewCount ?? 0;

    // ── 4. Monthly Enrollments (this month) ──
    // Count enrollments for this creator's courses created in the current calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnrollments = await db.enrollment.count({
      where: {
        course: { creatorId },
        enrolledAt: { gte: startOfMonth },
      },
    });

    // ── 5. Last-month comparisons ──
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Last month enrollments
    const lastMonthEnrollments = await db.enrollment.count({
      where: {
        course: { creatorId },
        enrolledAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // Last month students (unique)
    const lastMonthStudentsResult = await db.enrollment.findMany({
      where: {
        course: { creatorId },
        enrolledAt: { lte: endOfLastMonth },
      },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    const lastMonthStudents = lastMonthStudentsResult.length;

    // Last month active courses — courses published by end of last month
    const lastMonthActiveCourses = await db.course.count({
      where: {
        creatorId,
        status: "PUBLISHED",
        publishedAt: { lte: endOfLastMonth },
      },
    });

    // Last month total views — using CourseAnalytics for the last month range
    const lastMonthViewsAgg = await db.courseAnalytics.aggregate({
      where: {
        course: { creatorId },
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { views: true },
    });
    const lastMonthViews = lastMonthViewsAgg._sum.views ?? 0;

    // ── Helper: compute delta % safely ──
    function delta(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    }

    // ── 6. Creator profile info ──
    const user = await db.user.findUnique({
      where: { id: creatorId },
      select: { name: true, image: true },
    });

    return NextResponse.json({
      stats: [
        {
          title: "Total Students",
          value: totalStudents,
          delta: delta(totalStudents, lastMonthStudents),
          lastMonth: lastMonthStudents,
          positive: totalStudents >= lastMonthStudents,
          prefix: "",
          suffix: "",
        },
        {
          title: "Monthly Enrollments",
          value: monthlyEnrollments,
          delta: delta(monthlyEnrollments, lastMonthEnrollments),
          lastMonth: lastMonthEnrollments,
          positive: monthlyEnrollments >= lastMonthEnrollments,
          prefix: "",
          suffix: "",
        },
        {
          title: "Active Courses",
          value: activeCourses,
          delta: delta(activeCourses, lastMonthActiveCourses),
          lastMonth: lastMonthActiveCourses,
          positive: activeCourses >= lastMonthActiveCourses,
          prefix: "",
          suffix: "",
        },
        {
          title: "Total Views",
          value: totalViews,
          delta: delta(totalViews, lastMonthViews),
          lastMonth: lastMonthViews,
          positive: totalViews >= lastMonthViews,
          prefix: "",
          suffix: "",
        },
      ],
      creator: {
        name: user?.name ?? "Creator",
        image: user?.image ?? null,
      },
    });
  } catch (error) {
    console.error("Creator stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator stats" },
      { status: 500 }
    );
  }
}
