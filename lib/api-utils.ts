import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/client";

// ==========================================
// Standard API Response Helpers
// ==========================================

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

// ==========================================
// Authentication Helpers
// ==========================================

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("You must be logged in");
  }
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    throw new ForbiddenError("You don't have permission to do this");
  }
  return user;
}

// ==========================================
// Custom Error Classes
// ==========================================

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// ==========================================
// Error Handler Wrapper
// ==========================================

type ApiHandler = (req: Request, context?: unknown) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, context?: unknown) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof AuthError) {
        return errorResponse("UNAUTHORIZED", error.message, 401);
      }
      if (error instanceof ForbiddenError) {
        return errorResponse("FORBIDDEN", error.message, 403);
      }
      if (error instanceof NotFoundError) {
        return errorResponse("NOT_FOUND", error.message, 404);
      }

      console.error("[API_ERROR]", error);
      return errorResponse(
        "INTERNAL_ERROR",
        "Something went wrong. Please try again.",
        500
      );
    }
  };
}

// ==========================================
// Pagination Helper
// ==========================================

export function parsePagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit")) || 20)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
