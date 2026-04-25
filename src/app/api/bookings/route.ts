import "@/models";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createBooking, getAllBookings } from "@/services/booking.service";
import {
  createBookingSchema,
  getBookingsQuerySchema,
} from "@/lib/validations/booking.validation";
import { ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createBookingSchema.parse(body);

    const booking = await createBooking(input);

    return NextResponse.json(
      { success: true, message: "Booking created successfully", data: booking },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "POST /api/bookings");
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const query = getBookingsQuerySchema.parse({
      page:       searchParams.get("page")       ?? undefined,
      limit:      searchParams.get("limit")      ?? undefined,
      userId:     searchParams.get("userId")     ?? undefined,
      providerId: searchParams.get("providerId") ?? undefined,
      status:     searchParams.get("status")     ?? undefined,
    });

    const { page, limit, ...filters } = query;
    const result = await getAllBookings(page, limit, filters);

    return NextResponse.json(
      { success: true, ...result },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "GET /api/bookings");
  }
}

function handleError(error: unknown, context: string): NextResponse {
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
  console.error(`[${context}]`, error);
  return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
  );
}