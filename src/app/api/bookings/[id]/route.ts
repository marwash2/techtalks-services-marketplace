import "@/models";
import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  deleteBooking,
} from "@/services/booking.service";
import { updateBookingSchema } from "@/lib/validations/booking.validation";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/bookings/[id] ────────────────────────────────────────────────────

export const GET = withApiHandler(async (req: Request, context: RouteContext) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { id } = await context.params;
  const booking = await getBookingById(id);

  return Response.json(successResponse(booking));
});

// ── PATCH /api/bookings/[id] ──────────────────────────────────────────────────

export const PATCH = withApiHandler(async (req: Request, context: RouteContext) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { id } = await context.params;
  const body = await req.json();
  const input = updateBookingSchema.parse(body);

  const booking = await updateBooking(id, input);

  return Response.json(successResponse(booking, "Booking updated successfully"));
});

// ── DELETE /api/bookings/[id] ─────────────────────────────────────────────────

export const DELETE = withApiHandler(async (req: Request, context: RouteContext) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { id } = await context.params;
  await deleteBooking(id);

  return Response.json(successResponse(null, "Booking deleted successfully"));
});

