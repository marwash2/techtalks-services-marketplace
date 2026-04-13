import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name too short"),
  description: z.string().optional(),
  icon: z.string().optional(),
  slug: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();