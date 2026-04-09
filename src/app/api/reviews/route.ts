import { connectDB } from "@/lib/db";
import { Review } from "@/lib/schemas/Review.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT)
    );
    const providerId = req.nextUrl.searchParams.get("providerId");
    const serviceId = req.nextUrl.searchParams.get("serviceId");

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (providerId) filter.providerId = providerId;
    if (serviceId) filter.serviceId = serviceId;

    const reviews = await Review.find(filter)
      .populate("userId providerId serviceId")
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await Review.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, providerId, serviceId, rating, comment } = body;

    if (!userId || !providerId || !serviceId || !rating) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.INVALID_INPUT },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const review = new Review({
      userId,
      providerId,
      serviceId,
      rating,
      comment,
    });

    await review.save();

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.CREATE, data: review },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}
