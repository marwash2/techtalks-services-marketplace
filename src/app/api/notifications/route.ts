import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/schemas/Notification.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT)
    );
    const userId = req.nextUrl.searchParams.get("userId");
    const isRead = req.nextUrl.searchParams.get("isRead");

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (isRead !== null) filter.isRead = isRead === "true";

    const notifications = await Notification.find(filter)
      .populate("userId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const total = await Notification.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: notifications,
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
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type: type || "other",
      link,
    });

    await notification.save();

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.CREATE, data: notification },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}
