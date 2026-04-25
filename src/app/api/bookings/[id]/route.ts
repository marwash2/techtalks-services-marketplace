/**
 * @file app/api/bookings/[id]/route.ts
 * GET /api/bookings/[id]
 */

import "@/models";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getBookingById } from "@/services/booking.service";
import { ApiError } from "@/lib/api-error";

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/bookings/[id] ───────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  try {
    const booking = await getBookingById(id);

    return NextResponse.json(
      { success: true, data: booking },
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
  console.error(`[GET /api/bookings/${id}]`, error);
  return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
  );
}