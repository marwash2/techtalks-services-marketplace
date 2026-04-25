import { z } from "zod";
import { BOOKING_STATUS, PAGINATION } from "@/constants/config";

// ─── Status Tuple ─────────────────────────────────────────────────────────────

const BOOKING_STATUS_VALUES = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
] as const;

export type BookingStatusValue = (typeof BOOKING_STATUS_VALUES)[number];

// ─── Transition Map ───────────────────────────────────────────────────────────

export const ALLOWED_TRANSITIONS: Record<BookingStatusValue, BookingStatusValue[]> = {
  [BOOKING_STATUS.PENDING]:   [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
};

// ─── Create Booking ───────────────────────────────────────────────────────────
// Your existing schema — untouched

export const createBookingSchema = z.object({
  userId:     z.string().min(1, "User ID is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  serviceId:  z.string().min(1, "Service ID is required"),
  date:       z.string().datetime("Invalid date format"),
  price:      z.number().positive("Price must be a positive number"),
  notes:      z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ─── Update Booking ───────────────────────────────────────────────────────────
// Your existing schema — untouched

export const updateBookingSchema = z.object({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  notes:  z.string().optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// ─── Status Update (strict — only for PATCH /[id]/status) ────────────────────
// Uses .refine() + .transform() to avoid z.enum() + .pipe() typing issues

export const updateStatusSchema = z.object({
  status: z
    .string()
    .min(1, "status is required")
    .refine(
      (s) => (BOOKING_STATUS_VALUES as readonly string[]).includes(s.toLowerCase()),
      {
        message: `status must be one of: ${BOOKING_STATUS_VALUES.join(", ")}`,
      }
    )
    .transform((s) => s.toLowerCase() as BookingStatusValue),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// ─── GET Bookings Query ───────────────────────────────────────────────────────

export const getBookingsQuerySchema = z.object({
  page:       z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit:      z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  userId:     z.string().optional(),
  providerId: z.string().optional(),
  status:     z.enum(BOOKING_STATUS_VALUES).optional(),
});

export type GetBookingsQuery = z.infer<typeof getBookingsQuerySchema>;