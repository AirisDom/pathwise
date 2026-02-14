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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const creatorId = session.user.id;
    const now = new Date();

    // ── Build the last 30 days (today inclusive) ──
    const days: { date: string; label: string; start: Date; end: Date }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dateKey = d.toISOString().slice(0, 10);
      days.push({ date: dateKey, label, start, end });
    }

    const thirtyDaysAgo = days[0].start;

    // ── Get all course analytics for this creator's courses in the last 30 days ──
    const analytics = await db.courseAnalytics.findMany({
      where: {
        course: { creatorId },
        date: { gte: thirtyDaysAgo },
      },
      select: { date: true, views: true },
    });

    // ── Group views by day ──
    const viewsByDay: Record<string, number> = {};
    for (const a of analytics) {
      const key = a.date.toISOString().slice(0, 10);
      viewsByDay[key] = (viewsByDay[key] || 0) + a.views;
    }

    // ── Build chart data ──
    const chartData = days.map((day) => ({
      date: day.label,
      dateKey: day.date,
      value: viewsByDay[day.date] ?? 0,
    }));

    // ── Total views (all time) from course.viewCount ──
    const viewsAgg = await db.course.aggregate({
      where: { creatorId },
      _sum: { viewCount: true },
    });
    const totalViews = viewsAgg._sum.viewCount ?? 0;

    // ── Summary metrics ──
    const values = chartData.map((d) => d.value);
    const monthlyViews = values.reduce((sum, v) => sum + v, 0);
    const todaysViews = chartData[chartData.length - 1].value;
    const yesterdaysViews =
      chartData.length >= 2 ? chartData[chartData.length - 2].value : 0;

    let dailyChange = 0;
    if (yesterdaysViews === 0) {
      dailyChange = todaysViews > 0 ? 100 : 0;
    } else {
      dailyChange = parseFloat(
        (((todaysViews - yesterdaysViews) / yesterdaysViews) * 100).toFixed(1)
      );
    }

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const highDay = chartData.find((d) => d.value === maxValue);
    const lowDay = chartData.find((d) => d.value === minValue);

    return NextResponse.json({
      chartData,
      summary: {
        totalViews,
        monthlyViews,
        todaysViews,
        dailyChange,
        high: { value: maxValue, date: highDay?.date ?? "" },
        low: { value: minValue, date: lowDay?.date ?? "" },
      },
    });
  } catch (error) {
    console.error("Views chart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch views data" },
      { status: 500 }
    );
  }
}
