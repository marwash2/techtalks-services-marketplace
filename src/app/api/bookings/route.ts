import "@/models";
import { Service } from "@/models/Service.model";
import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBooking, getAllBookings } from "@/services/booking.service";
import {
  createBookingSchema,
  getBookingsQuerySchema,
} from "@/lib/validations/booking.validation";

export const POST = withApiHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const body = await req.json();
  const input = createBookingSchema.parse(body);

  const service = await Service.findById(input.serviceId).lean();
  if (!service) throw new ApiError("Service not found", 404);

  const booking = await createBooking({
    userId:     session.user.id,
    providerId: input.providerId,
    serviceId:  input.serviceId,
    date:       input.date,
    time:       input.time,
    price:      (service as any).price,
    notes:      input.notes,
  });

  return Response.json(
    successResponse(booking, "Booking created successfully"),
    { status: 201 }
  );
});

export const GET = withApiHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);

  const query = getBookingsQuerySchema.parse({
    page:       searchParams.get("page")       ?? undefined,
    limit:      searchParams.get("limit")      ?? undefined,
    userId:     searchParams.get("userId")     ?? undefined,
    providerId: searchParams.get("providerId") ?? undefined,
    status:     searchParams.get("status")     ?? undefined,
  });

  const { page, limit, ...filters } = query;
  const result = await getAllBookings(page, limit, filters);

  return Response.json(successResponse(result));
});