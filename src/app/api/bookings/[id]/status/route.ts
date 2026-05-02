/**
 * @file app/api/bookings/[id]/status/route.ts
 * PATCH /api/bookings/[id]/status
 */

import "@/models";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getBookingById, updateBooking } from "@/services/booking.service";
import { createNotification } from "@/services/notification.service";
import {
  updateStatusSchema,
  ALLOWED_TRANSITIONS,
  BookingStatusValue,
} from "@/lib/validations/booking.validation";
import { ApiError } from "@/lib/api-error";
import { MESSAGES } from "@/constants/config";

type RouteContext = { params: Promise<{ id: string }> };

function resolveRefId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const ref = value as { _id?: unknown; id?: unknown };
    if (typeof ref._id === "string") return ref._id;
    if (typeof ref.id === "string") return ref.id;
    if (ref._id) return String(ref._id);
    if (ref.id) return String(ref.id);
  }
  return String(value ?? "");
}

const STATUS_NOTIFICATION_COPY: Record<
  BookingStatusValue,
  {
    userTitle: string;
    userMessage: string;
    providerTitle: string;
    providerMessage: string;
  }
> = {
  pending: {
    userTitle: "Booking Pending",
    userMessage: "Your booking is pending provider response.",
    providerTitle: "Booking Pending",
    providerMessage: "This booking is currently pending.",
  },
  confirmed: {
    userTitle: "Booking Confirmed",
    userMessage: "Your booking has been confirmed by the provider.",
    providerTitle: "Booking Accepted",
    providerMessage: "You accepted this booking request.",
  },
  cancelled: {
    userTitle: "Booking Cancelled",
    userMessage: "Your booking has been cancelled.",
    providerTitle: "Booking Cancelled",
    providerMessage: "This booking has been cancelled.",
  },
  completed: {
    userTitle: "Service Completed",
    userMessage: "Your booking was marked as completed.",
    providerTitle: "Service Completed",
    providerMessage: "You marked this booking as completed.",
  },
};

// ─── PATCH /api/bookings/[id]/status ─────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { status: newStatus } = updateStatusSchema.parse(body);

    // 1. Fetch current booking
    const booking = await getBookingById(id);
    const currentStatus = booking.status as BookingStatusValue;

    // 2. Guard: already in target state
    if (currentStatus === newStatus) {
      return NextResponse.json(
        { success: false, message: `Booking is already "${currentStatus}"` },
        { status: 409 }
      );
    }

    // 3. Guard: terminal state (cancelled / completed)
    if (ALLOWED_TRANSITIONS[currentStatus].length === 0) {
      return NextResponse.json(
        { success: false, message: `Cannot update a "${currentStatus}" booking — this status is final` },
        { status: 409 }
      );
    }

    // 4. Guard: invalid transition
    if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid transition: "${currentStatus}" → "${newStatus}". Allowed: ${ALLOWED_TRANSITIONS[currentStatus].join(", ")}`,
        },
        { status: 409 }
      );
    }

    // 5. Apply
    const updated = await updateBooking(id, { status: newStatus });

    const copy = STATUS_NOTIFICATION_COPY[newStatus];
    const userId = resolveRefId(
      (booking as { userId?: unknown; user?: { id?: unknown; _id?: unknown } }).userId
      ?? (booking as { user?: { id?: unknown; _id?: unknown } }).user?.id
      ?? (booking as { user?: { id?: unknown; _id?: unknown } }).user?._id
    );
    const providerId = resolveRefId(
      (booking as { providerId?: unknown; provider?: { id?: unknown; _id?: unknown } }).providerId
      ?? (booking as { provider?: { id?: unknown; _id?: unknown } }).provider?.id
      ?? (booking as { provider?: { id?: unknown; _id?: unknown } }).provider?._id
    );

    if (!userId || !providerId) {
      return NextResponse.json(
        { success: false, message: "Booking references are invalid" },
        { status: 400 }
      );
    }

    await Promise.all([
      createNotification({
        userId,
        title: copy.userTitle,
        message: copy.userMessage,
        type: "booking",
        link: `/user/bookings/${id}`,
      }),
      createNotification({
        userId: providerId,
        title: copy.providerTitle,
        message: copy.providerMessage,
        type: "booking",
        link: "/provider/bookings",
      }),
    ]);

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.UPDATE, data: updated },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, id);
  }
}

// ─── Error Handler ────────────────────────────────────────────────────────────

function handleError(error: unknown, id: string): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }
  console.error(`[PATCH /api/bookings/${id}/status]`, error);
  return NextResponse.json(
    { success: false, message: MESSAGES.ERROR.SERVER_ERROR },
    { status: 500 }
  );
}
