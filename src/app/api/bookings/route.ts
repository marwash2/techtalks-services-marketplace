import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES, PAGINATION } from "@/constants/config";
import * as bookingService from "@/services/booking.service";
import { createBookingSchema } from "@/lib/validations/booking.validation";

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT));
  const userId = searchParams.get("userId") || undefined;
  const providerId = searchParams.get("providerId") || undefined;
  const status = searchParams.get("status") || undefined;

  const result = await bookingService.getAllBookings(page, limit, { userId, providerId, status });
  return Response.json(successResponse(result));
});

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createBookingSchema.parse(body);
  const booking = await bookingService.createBooking(validated);
  return Response.json(successResponse(booking, MESSAGES.SUCCESS.CREATE), { status: 201 });
});