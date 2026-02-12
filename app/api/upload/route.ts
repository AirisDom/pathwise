import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
];

function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export async function POST(req: Request) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "image" | "video"

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "No file provided." } },
        { status: 400 }
      );
    }

    const fileType = type || (ALLOWED_IMAGE_TYPES.includes(file.type) ? "image" : "video");

    // Validate file type
    if (fileType === "image") {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TYPE",
              message: `Invalid image type. Allowed: JPEG, PNG, WebP, GIF.`,
            },
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: `Image must be under 10MB. Got ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
            },
          },
          { status: 400 }
        );
      }
    } else if (fileType === "video") {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TYPE",
              message: `Invalid video type. Allowed: MP4, WebM, MOV, AVI, MKV.`,
            },
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: `Video must be under 500MB. Got ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
            },
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: "Type must be 'image' or 'video'." } },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = getExtension(file.name);
    const uniqueName = `${uuidv4()}${ext}`;
    const subfolder = fileType === "image" ? "images" : "videos";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Public URL
    const url = `/uploads/${subfolder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        filename: uniqueName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Upload failed. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
