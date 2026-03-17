import { z } from "zod";

export const createWorksheetSchema = z.object({
  type: z.enum(["catch_check_change", "opening_up", "inner_rules"]),
  title: z.string().max(255).optional(),
  responses: z.record(z.unknown()),
});

export const updateWorksheetSchema = z.object({
  title: z.string().max(255).optional(),
  responses: z.record(z.unknown()).optional(),
});

export const worksheetQuerySchema = z.object({
  type: z.enum(["catch_check_change", "opening_up", "inner_rules"]).optional(),
});

export type CreateWorksheetInput = z.infer<typeof createWorksheetSchema>;
export type UpdateWorksheetInput = z.infer<typeof updateWorksheetSchema>;
