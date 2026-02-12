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
      const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.push({ date: dateKey, label, start, end });
    }

    // ── Get all enrollments for this creator's courses in the last 30 days ──
    const thirtyDaysAgo = days[0].start;

    const enrollments = await db.enrollment.findMany({
      where: {
        course: { creatorId },
        enrolledAt: { gte: thirtyDaysAgo },
      },
      select: { enrolledAt: true },
    });

    // ── Group enrollments by day ──
    const enrollmentsByDay: Record<string, number> = {};
    for (const e of enrollments) {
      const key = e.enrolledAt.toISOString().slice(0, 10);
      enrollmentsByDay[key] = (enrollmentsByDay[key] || 0) + 1;
    }

    // ── Build chart data: each day gets its enrollment count ──
    const chartData = days.map((day) => ({
      date: day.label,       // "Feb 12"
      dateKey: day.date,     // "2026-02-12"
      value: enrollmentsByDay[day.date] ?? 0,
    }));

    // ── Compute summary metrics ──
    const values = chartData.map((d) => d.value);
    const monthlyRevenue = values.reduce((sum, v) => sum + v, 0);
    const todaysRevenue = chartData[chartData.length - 1].value;

    // Yesterday's revenue for daily change calculation
    const yesterdaysRevenue = chartData.length >= 2
      ? chartData[chartData.length - 2].value
      : 0;

    // Daily change: today vs yesterday
    let dailyChange = 0;
    if (yesterdaysRevenue === 0) {
      dailyChange = todaysRevenue > 0 ? 100 : 0;
    } else {
      dailyChange = parseFloat(
        (((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100).toFixed(1)
      );
    }

    // High & Low days
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const highDay = chartData.find((d) => d.value === maxValue);
    const lowDay = chartData.find((d) => d.value === minValue);

    return NextResponse.json({
      chartData,
      summary: {
        monthlyRevenue,     // total enrollments last 30 days
        todaysRevenue,      // enrollments today
        dailyChange,        // % change today vs yesterday
        high: {
          value: maxValue,
          date: highDay?.date ?? "",
        },
        low: {
          value: minValue,
          date: lowDay?.date ?? "",
        },
      },
    });
  } catch (error) {
    console.error("Revenue chart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}
