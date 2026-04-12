import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as bookingService from "@/services/booking.service";
import { updateBookingSchema } from "@/lib/validations/booking.validation";

export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  const booking = await bookingService.getBookingById(id);
  return Response.json(successResponse(booking));
});

export const PUT = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const validated = updateBookingSchema.parse(body);
  const booking = await bookingService.updateBooking(id, validated);
  return Response.json(successResponse(booking, MESSAGES.SUCCESS.UPDATE));
});

export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = await params;
  await bookingService.deleteBooking(id);
  return Response.json(successResponse(null, MESSAGES.SUCCESS.DELETE));
});