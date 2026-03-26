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

    // Get CourseAnalytics for last 14 days
    const analytics = await db.courseAnalytics.findMany({
      where: {
        course: { creatorId },
        date: { gte: fourteenDaysAgo },
      },
      select: { date: true, views: true, enrollments: true, completions: true },
    });

    // Group by day
    const viewsByDay: Record<string, number> = {};
    const enrollmentsByDay: Record<string, number> = {};
    const completionsByDay: Record<string, number> = {};
    for (const a of analytics) {
      const key = a.date.toISOString().slice(0, 10);
      viewsByDay[key] = (viewsByDay[key] || 0) + a.views;
      enrollmentsByDay[key] = (enrollmentsByDay[key] || 0) + a.enrollments;
      completionsByDay[key] = (completionsByDay[key] || 0) + a.completions;
    }

    const chartData = {
      videoViews: days.map((d) => ({
        date: d.key,
        value: viewsByDay[d.key] || 0,
      })),
      lessonCompletions: days.map((d) => ({
        date: d.key,
        value: completionsByDay[d.key] || 0,
      })),
      enrollments: days.map((d) => ({
        date: d.key,
        value: enrollmentsByDay[d.key] || 0,
      })),
    };

    // Metrics
    const viewsAgg = await db.course.aggregate({
      where: { creatorId },
      _sum: { viewCount: true },
    });

    const avgProgressAgg = await db.enrollment.aggregate({
      where: { course: { creatorId } },
      _avg: { progress: true },
    });

    const reviews = await db.review.findMany({
      where: { course: { creatorId } },
      select: { rating: true },
    });
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

    return NextResponse.json({
      chartData,
      metrics: {
        totalViews: viewsAgg._sum.viewCount ?? 0,
        avgCompletion: Math.round(Number(avgProgressAgg._avg.progress ?? 0)),
        avgRating,
      },
    });
  } catch (error) {
    console.error("Engagement API error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
