import { z } from "zod";

export const createProviderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  businessName: z.string().min(2, "Business name too short"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  avatar: z.string().url("Invalid avatar URL").nullable().optional(),
});

export const updateProviderSchema = createProviderSchema.partial();