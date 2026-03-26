import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const creatorId = session.user.id;
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId") || undefined;
    const rating = url.searchParams.get("rating");
    const sort = url.searchParams.get("sort") || "newest";

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" as const }
        : sort === "highest"
        ? { rating: "desc" as const }
        : sort === "lowest"
        ? { rating: "asc" as const }
        : { createdAt: "desc" as const };

    const reviews = await db.review.findMany({
      where: {
        course: {
          creatorId,
          ...(courseId && { id: courseId }),
        },
        ...(rating && { rating: parseInt(rating) }),
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, image: true },
        },
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
      },
      orderBy,
    });

    // Rating distribution
    const allReviews = await db.review.findMany({
      where: { course: { creatorId } },
      select: { rating: true },
    });

    const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    let totalRating = 0;
    for (const r of allReviews) {
      distribution[r.rating - 1]++;
      totalRating += r.rating;
    }
    const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : "0";

    // Creator's courses for filter
    const courses = await db.course.findMany({
      where: { creatorId, status: "PUBLISHED" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      reviews,
      totalReviews: allReviews.length,
      avgRating,
      distribution,
      courses,
    });
  } catch (error) {
    console.error("Creator reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
