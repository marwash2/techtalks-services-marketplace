import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z
    .enum([
      "booking",
      "booking_created",
      "booking_pending",
      "booking_confirmed",
      "booking_cancelled",
      "booking_completed",
      "booking_updated",
      "booking_reminder_24h",
      "booking_reminder_6h",
      "booking_reminder_3h",
      "service_updated",
      "service_deleted",
      "service_added",
      "review",
      "message",
      "promotion",
      "system",
      "other",
    ])
    .optional(),
  link: z
    .string()
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//.test(value),
      "Link must be a relative path or absolute URL"
    )
    .optional(),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  title: z.string().optional(),
  message: z.string().optional(),
});
