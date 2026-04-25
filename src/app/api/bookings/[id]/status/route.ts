/**
 * @file app/api/bookings/[id]/status/route.ts
 * PATCH /api/bookings/[id]/status
 */

import "@/models";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getBookingById, updateBooking } from "@/services/booking.service";
import {
  updateStatusSchema,
  ALLOWED_TRANSITIONS,
  BookingStatusValue,
} from "@/lib/validations/booking.validation";
import { ApiError } from "@/lib/api-error";
import { MESSAGES } from "@/constants/config";

type RouteContext = { params: Promise<{ id: string }> };

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