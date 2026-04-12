import { z } from "zod";
import { SERVICE_CONFIG } from "@/constants/config";

export const createServiceSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  title: z.string().min(2, "Title too short"),
  description: z.string().optional(),
  price: z.number()
    .min(SERVICE_CONFIG.MIN_PRICE, "Price cannot be negative")
    .max(SERVICE_CONFIG.MAX_PRICE, "Price too high"),
  duration: z.number()
    .min(SERVICE_CONFIG.MIN_DURATION, "Duration too short")
    .max(SERVICE_CONFIG.MAX_DURATION, "Duration too long"),
  image: z.string().url("Invalid image URL").nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();