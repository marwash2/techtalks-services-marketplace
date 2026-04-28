import { z } from "zod";

export const createProviderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  businessName: z.string().min(2, "Business name too short"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  avatar: z.string().url("Invalid avatar URL").nullable().optional(),
});

export const providerOnboardingSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z.string().min(10, "Description must be at least 10 characters").optional()),
  avatar: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z.string().url("Invalid avatar URL").nullable().optional()),
});

export const updateProviderSchema = createProviderSchema.partial();
