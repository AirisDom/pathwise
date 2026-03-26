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
    const search = url.searchParams.get("search") || undefined;

    // Get all enrollments for this creator's courses
    const enrollments = await db.enrollment.findMany({
      where: {
        course: {
          creatorId,
          ...(courseId && { id: courseId }),
        },
        ...(search && {
          student: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }),
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, image: true, createdAt: true },
        },
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Group by student
    const studentMap = new Map<
      string,
      {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        joinedAt: Date;
        courses: {
          id: string;
          title: string;
          thumbnail: string | null;
          progress: number;
          isCompleted: boolean;
          enrolledAt: Date;
          lastAccessedAt: Date | null;
        }[];
      }
    >();

    for (const e of enrollments) {
      const s = e.student;
      if (!studentMap.has(s.id)) {
        studentMap.set(s.id, {
          id: s.id,
          name: s.name,
          email: s.email,
          image: s.image,
          joinedAt: s.createdAt,
          courses: [],
        });
      }
      studentMap.get(s.id)!.courses.push({
        id: e.course.id,
        title: e.course.title,
        thumbnail: e.course.thumbnail,
        progress: Number(e.progress),
        isCompleted: e.isCompleted,
        enrolledAt: e.enrolledAt,
        lastAccessedAt: e.lastAccessedAt,
      });
    }

    const students = Array.from(studentMap.values()).map((s) => ({
      ...s,
      totalCourses: s.courses.length,
      avgProgress: Math.round(
        s.courses.reduce((sum, c) => sum + c.progress, 0) / s.courses.length
      ),
      lastActive: s.courses.reduce<Date | null>((latest, c) => {
        if (!c.lastAccessedAt) return latest;
        if (!latest) return c.lastAccessedAt;
        return c.lastAccessedAt > latest ? c.lastAccessedAt : latest;
      }, null),
    }));

    // Get creator's courses for filter dropdown
    const creatorCourses = await db.course.findMany({
      where: { creatorId, status: "PUBLISHED" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      students,
      totalStudents: students.length,
      courses: creatorCourses,
    });
  } catch (error) {
    console.error("Creator students error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
