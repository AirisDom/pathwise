import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/creator/settings — Fetch creator profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        title: true,
        creatorProfile: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT /api/creator/settings — Update creator profile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const userId = session.user.id;

    // Update user profile fields
    if (body.profile) {
      const { name, bio, title } = body.profile;
      await db.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(bio !== undefined && { bio }),
          ...(title !== undefined && { title }),
        },
      });
    }

    // Update creator profile
    if (body.creatorProfile) {
      const { headline, expertise, experienceYears, bio, website, twitter, linkedin, youtube } =
        body.creatorProfile;
      await db.creatorProfile.upsert({
        where: { userId },
        update: {
          ...(headline !== undefined && { headline }),
          ...(expertise !== undefined && { expertise }),
          ...(experienceYears !== undefined && { experienceYears: parseInt(experienceYears) || null }),
          ...(bio !== undefined && { bio }),
          ...(website !== undefined && { website }),
          ...(twitter !== undefined && { twitter }),
          ...(linkedin !== undefined && { linkedin }),
          ...(youtube !== undefined && { youtube }),
        },
        create: {
          userId,
          headline: headline || null,
          expertise: expertise || null,
          experienceYears: parseInt(experienceYears) || null,
          bio: bio || null,
          website: website || null,
          twitter: twitter || null,
          linkedin: linkedin || null,
          youtube: youtube || null,
        },
      });
    }

    // Change password
    if (body.password) {
      const { currentPassword, newPassword } = body.password;
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Current and new password required" },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: "No password set for this account" },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: userId },
        data: { password: hashed },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
