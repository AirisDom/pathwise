import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const verifySchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = verifySchema.safeParse(body);

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

    const { email, code } = validated.data;

    // Find the latest unused code for this email
    const verificationRecord = await db.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expires: { gt: new Date() }, // not expired
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CODE",
            message: "Invalid or expired verification code",
          },
        },
        { status: 400 }
      );
    }

    // Mark the code as used
    await db.emailVerificationCode.update({
      where: { id: verificationRecord.id },
      data: { used: true },
    });

    // Mark the user's email as verified
    const user = await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Email verified successfully! You can now sign in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]", error);
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
