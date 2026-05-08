import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),

  // icon is required in the Mongoose schema — must match here
  icon: z
    .string({ required_error: "Icon is required" })
    .min(1, "Icon cannot be empty")
    .trim(),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .trim()
    .optional(),

  // slug is optional — auto-generated from name if not provided
  // if provided, must be URL-safe
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .optional(),

  parentId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid parent category ID")
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim()
    .optional(),

  icon: z
    .string()
    .min(1, "Icon cannot be empty")
    .trim()
    .optional(),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .trim()
    .optional(),

  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .optional(),

  parentId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid parent category ID")
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;