import { z } from "zod";

// Edinburgh Postnatal Depression Scale has 10 questions, each scored 0-3
export const createScreeningSchema = z.object({
  responses: z.array(
    z.object({
      question: z.number().int().min(1).max(10),
      answer: z.number().int().min(0).max(3),
    })
  ).length(10, "All 10 EPDS questions must be answered"),
});

export type CreateScreeningInput = z.infer<typeof createScreeningSchema>;
