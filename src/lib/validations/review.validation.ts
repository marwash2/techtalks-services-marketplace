import { z } from "zod";

export const createReviewSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  rating: z.number().min(1, "Rating min is 1").max(5, "Rating max is 5"),
  comment: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});