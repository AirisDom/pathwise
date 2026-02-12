import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateOTP, sendVerificationCode } from "@/lib/email";

const resendSchema = z.object({
  email: z.string().email("Invalid email"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = resendSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email",
          },
        },
        { status: 400 }
      );
    }

    const { email } = validated.data;

    // Check user exists and is not yet verified
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether user exists for security
      return NextResponse.json({
        success: true,
        message: "If your account exists, a new code has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_VERIFIED",
            message: "This email is already verified. Please sign in.",
          },
        },
        { status: 400 }
      );
    }

    // Rate limit: check if a code was sent in the last 60 seconds
    const recentCode = await db.emailVerificationCode.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Please wait 60 seconds before requesting a new code.",
          },
        },
        { status: 429 }
      );
    }

    // Invalidate old codes
    await db.emailVerificationCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate and store new code
    const code = generateOTP();
    await db.emailVerificationCode.create({
      data: {
        email,
        code,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send
    await sendVerificationCode(email, code);

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("[RESEND_CODE_ERROR]", error);
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
