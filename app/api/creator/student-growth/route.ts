import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const creatorId = session.user.id;
    const now = new Date();

    // Build last 14 days
    const days: { start: Date; end: Date; key: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push({
        start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
        key: d.toISOString().slice(0, 10),
      });
    }

    const fourteenDaysAgo = days[0].start;

    // Get all enrollments for creator's courses in this period
    const recentEnrollments = await db.enrollment.findMany({
      where: {
        course: { creatorId },
        enrolledAt: { gte: fourteenDaysAgo },
      },
      select: { enrolledAt: true },
    });

    // Get all active students (lastAccessedAt in period)
    const activeEnrollments = await db.enrollment.findMany({
      where: {
        course: { creatorId },
        lastAccessedAt: { gte: fourteenDaysAgo },
      },
      select: { studentId: true, lastAccessedAt: true, enrolledAt: true },
    });

    // Group new students by day
    const newByDay: Record<string, number> = {};
    for (const e of recentEnrollments) {
      const key = e.enrolledAt.toISOString().slice(0, 10);
      newByDay[key] = (newByDay[key] || 0) + 1;
    }

    // Group active students by day (unique per day)
    const activeByDay: Record<string, Set<string>> = {};
    const returningByDay: Record<string, Set<string>> = {};
    for (const e of activeEnrollments) {
      if (!e.lastAccessedAt) continue;
      const key = e.lastAccessedAt.toISOString().slice(0, 10);
      if (!activeByDay[key]) activeByDay[key] = new Set();
      activeByDay[key].add(e.studentId);

      // Returning = enrolled before this day and active on this day
      const dayStart = new Date(key + "T00:00:00.000Z");
      if (e.enrolledAt < dayStart) {
        if (!returningByDay[key]) returningByDay[key] = new Set();
        returningByDay[key].add(e.studentId);
      }
    }

    // Build chart series
    const chartData = {
      newStudents: days.map((d) => ({
        date: d.key,
        value: newByDay[d.key] || 0,
      })),
      activeStudents: days.map((d) => ({
        date: d.key,
        value: activeByDay[d.key]?.size || 0,
      })),
      returningStudents: days.map((d) => ({
        date: d.key,
        value: returningByDay[d.key]?.size || 0,
      })),
    };

    // Metrics
    const totalStudentsResult = await db.enrollment.findMany({
      where: { course: { creatorId } },
      select: { studentId: true },
      distinct: ["studentId"],
    });

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnrollments = await db.enrollment.count({
      where: {
        course: { creatorId },
        enrolledAt: { gte: startOfMonth },
      },
    });

    const totalEnrollments = await db.enrollment.count({
      where: { course: { creatorId } },
    });
    const completedEnrollments = await db.enrollment.count({
      where: { course: { creatorId }, isCompleted: true },
    });
    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    return NextResponse.json({
      chartData,
      metrics: {
        totalStudents: totalStudentsResult.length,
        newEnrollments: monthlyEnrollments,
        completionRate,
      },
    });
  } catch (error) {
    console.error("Student growth API error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
