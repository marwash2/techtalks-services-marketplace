import "@/models";
import { Service } from "@/models/Service.model";
import { Provider } from "@/models/Provider.model";
import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBooking, getAllBookings } from "@/services/booking.service";
import { createNotification } from "@/services/notification.service";
import {
  createBookingSchema,
  getBookingsQuerySchema,
} from "@/lib/validations/booking.validation";
import { NextResponse } from "next/server";

function toId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const maybe = value as { _id?: unknown; id?: unknown };
    if (typeof maybe._id === "string") return maybe._id;
    if (typeof maybe.id === "string") return maybe.id;
    if (maybe._id) return String(maybe._id);
    if (maybe.id) return String(maybe.id);
  }
  return "";
}

export const POST = withApiHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const body = await req.json();
  const input = createBookingSchema.parse(body);

  const service = await Service.findById(input.serviceId).lean();
  if (!service) throw new ApiError("Service not found", 404);

  const booking = await createBooking({
    userId: session.user.id,
    providerId: input.providerId,
    serviceId: input.serviceId,
    date: input.date,
    time: input.time,
    price: (service as any).price,
    notes: input.notes,
  });

  const bookingId = String(booking.id);
  try {
    const provider = await Provider.findById(input.providerId).select("userId").lean();
    const providerUserId = toId((provider as { userId?: unknown } | null)?.userId);

    const tasks = [
      createNotification({
        userId: session.user.id,
        title: "Booking Requested",
        message: "Your booking request has been sent to the provider.",
        type: "booking_created",
        link: `/user/bookings/${bookingId}`,
      }),
    ];

    if (providerUserId) {
      tasks.push(
        createNotification({
          userId: providerUserId,
          title: "New Booking Received",
          message: "You received a new booking request that needs your response.",
          type: "booking_created",
          link: `/provider/bookings`,
        })
      );
    }

    await Promise.all(tasks);
  } catch (notificationError) {
    console.error("[POST /api/bookings] notification error:", notificationError);
  }

  return NextResponse.json(
    { success: true, message: "Booking created successfully", data: booking },
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
