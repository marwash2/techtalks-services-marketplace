import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/schemas/Booking.schema";
import { User } from "@/lib/schemas/User.schema";
import { Provider } from "@/lib/schemas/Provider.schema";
import { Service } from "@/lib/schemas/Service.schema";
import { MESSAGES, PAGINATION, BOOKING_STATUS } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT),
    );
    const userId = req.nextUrl.searchParams.get("userId");
    const providerId = req.nextUrl.searchParams.get("providerId");
    const status = req.nextUrl.searchParams.get("status");

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (providerId) filter.providerId = providerId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("userId", "name email")
      .populate("providerId", "businessName location")
      .populate("serviceId", "title price")
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await Booking.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, providerId, serviceId, date, notes } = body;

    if (!userId || !providerId || !serviceId || !date) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.INVALID_INPUT },
        { status: 400 },
      );
    }

    // validate user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // validate provider
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404 },
      );
    }

    // validate service
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 },
      );
    }

    // validate relation
    if (service.providerId.toString() !== providerId) {
      return NextResponse.json(
        { success: false, message: "Invalid provider-service relation" },
        { status: 400 },
      );
    }

    const booking = new Booking({
      userId,
      providerId,
      serviceId,
      date,
      notes,
      status: BOOKING_STATUS.PENDING,
    });

    await booking.save();

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.CREATE, data: booking },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
