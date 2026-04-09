import { connectDB } from "@/lib/db";
import { Service } from "@/lib/schemas/Service.schema";
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
    const categoryId = req.nextUrl.searchParams.get("categoryId");

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (providerId) filter.providerId = providerId;
    if (categoryId) filter.categoryId = categoryId;

    const services = await Service.find(filter)
      .populate("providerId categoryId")
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await Service.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: services,
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
    const { providerId, categoryId, title, description, price, duration } = body;

    if (!providerId || !categoryId || !title || !price || !duration) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const service = new Service({
      providerId,
      categoryId,
      title,
      description,
      price,
      duration,
    });

    await service.save();

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.CREATE, data: service },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}
