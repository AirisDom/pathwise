import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateOTP, sendVerificationCode } from "@/lib/email";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["STUDENT", "CREATOR"]).default("STUDENT"),
  // Creator-specific fields (optional, only used when role=CREATOR)
  headline: z.string().max(120).optional(),
  expertise: z.string().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  bio: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { name, email, password, role, headline, expertise, experienceYears, bio } = validated.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but hasn't verified email, allow re-sending code
      if (!existingUser.emailVerified) {
        const code = generateOTP();

        // Invalidate old codes
        await db.emailVerificationCode.updateMany({
          where: { email, used: false },
          data: { used: true },
        });

        // Create new code (expires in 10 minutes)
        await db.emailVerificationCode.create({
          data: {
            email,
            code,
            expires: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        // Send the verification email
        await sendVerificationCode(email, code);

        return NextResponse.json(
          {
            success: true,
            data: { email, requiresVerification: true },
            message: "Verification code resent to your email",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "A user with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (email NOT verified yet)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        title: role === "CREATOR" ? headline : undefined,
        bio: role === "CREATOR" ? bio : undefined,
        // emailVerified intentionally left null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // If creator, also create their creator profile with extra info
    if (role === "CREATOR") {
      await db.creatorProfile.create({
        data: {
          userId: user.id,
          headline,
          expertise,
          experienceYears,
          bio,
        },
      });
    }

    // Generate OTP and store it
    const code = generateOTP();

    await db.emailVerificationCode.create({
      data: {
        email,
        code,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send the verification email
    await sendVerificationCode(email, code);

    return NextResponse.json(
      {
        success: true,
        data: { email, requiresVerification: true },
        message: "Account created! Check your email for a verification code.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
