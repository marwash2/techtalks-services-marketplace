import { z } from "zod";
import { BOOKING_STATUS, PAGINATION } from "@/constants/config";

// ─── Status Tuple ─────────────────────────────────────────────────────────────
//fixed list of allowed values
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
// userId  → from session on server, NOT from frontend
// price   → looked up from DB on server, NOT from frontend

export const createBookingSchema = z.object({
  serviceId:  z.string().min(1, "Service ID is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((val) => {
      const today = new Date().toISOString().split("T")[0];
      return val >= today;
    }, "Booking date must be today or in the future"),
  time:  z.string().min(1, "Time slot is required"),
  notes: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ─── Update Booking ───────────────────────────────────────────────────────────

export const updateBookingSchema = z.object({
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  notes:  z.string().optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// ─── Status Update ────────────────────────────────────────────────────────────

export const updateStatusSchema = z.object({
  status: z
    .string()
    .min(1, "status is required")
    .refine(
      (s) => (BOOKING_STATUS_VALUES as readonly string[]).includes(s.toLowerCase()),
      { message: `status must be one of: ${BOOKING_STATUS_VALUES.join(", ")}` }
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