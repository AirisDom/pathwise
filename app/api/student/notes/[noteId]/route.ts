import { z } from "zod";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
  NotFoundError,
  ForbiddenError,
} from "@/lib/api-utils";

// ==========================================
// PUT /api/student/notes/[noteId] — Update a note
// ==========================================

export const PUT = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireAuth();
    const { noteId } = await (context as { params: Promise<{ noteId: string }> }).params;
    const body = await req.json();

    const schema = z.object({
      content: z.string().min(1).max(5000),
      timestamp: z.number().int().min(0).optional().nullable(),
    });
    const { content, timestamp } = schema.parse(body);

    const note = await db.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundError("Note not found");
    if (note.userId !== user.id) throw new ForbiddenError("Not your note");

    const updated = await db.note.update({
      where: { id: noteId },
      data: { content, ...(timestamp !== undefined && { timestamp }) },
    });

    return successResponse(updated, "Note updated!");
  }
);

// ==========================================
// DELETE /api/student/notes/[noteId] — Delete a note
// ==========================================

export const DELETE = withErrorHandler(
  async (req: Request, context: unknown) => {
    const user = await requireAuth();
    const { noteId } = await (context as { params: Promise<{ noteId: string }> }).params;

    const note = await db.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundError("Note not found");
    if (note.userId !== user.id) throw new ForbiddenError("Not your note");

    await db.note.delete({ where: { id: noteId } });

    return successResponse(null, "Note deleted!");
  }
);
