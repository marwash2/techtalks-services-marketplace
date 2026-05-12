import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking.model";
import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

// GET /api/bookings/availability?serviceId=...&date=...
export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date) {
    return Response.json(
      { success: false, message: "serviceId and date are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const bookedSlots = await Booking.find({
    serviceId,
    date,
    status: { $in: ["pending", "confirmed", "pending_payment"] },
  })
    .select("time -_id")
    .lean();

  const takenTimes = bookedSlots.map((b) => (b as { time: string }).time);

  return Response.json(successResponse({ date, takenTimes }));
});