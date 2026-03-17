import { z } from "zod";

export const resourcesQuerySchema = z.object({
  category: z.enum(["info", "podcast", "service", "coping_skill"]).optional(),
  audience: z.enum(["mothers", "fathers", "family", "all"]).optional(),
});
