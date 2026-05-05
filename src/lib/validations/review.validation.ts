import { z } from "zod";

/**
 * userId is intentionally excluded — it is always sourced from the
 * authenticated session in the route handler, never from the client.
 * Accepting userId from the body would allow impersonation attacks.
 */

const ratingSchema = z.coerce
  .number({
    message: "Rating must be a number",
  })
  .int("Rating must be an integer")
  .min(1, "Rating must be at least 1")
  .max(5, "Rating must be at most 5");

const commentSchema = z
  .string()
  .trim()
  .min(1, "Comment cannot be empty")
  .optional();

export const createReviewSchema = z.object({
  providerId: z.string().trim().min(1, "Provider ID is required"),
  serviceId: z.string().trim().min(1, "Service ID is required"),
  rating: ratingSchema,
  comment: commentSchema,
});

export const updateReviewSchema = z
  .object({
    rating: ratingSchema.optional(),
    comment: commentSchema,
  })
  .refine(
    (data) => data.rating !== undefined || data.comment !== undefined,
    {
      message: "At least one of rating or comment must be provided",
    }
  );

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;