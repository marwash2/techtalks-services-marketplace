import { z } from "zod";
import { BOOKING_STATUS } from "@/constants/config";

export const createBookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  date: z.string().datetime("Invalid date format"),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum([
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
  ]).optional(),
  notes: z.string().optional(),
});