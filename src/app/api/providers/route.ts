import { connectDB } from "@/lib/db";
import { Provider } from "@/lib/schemas/Provider.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/schemas/User.schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT),
    );

    const skip = (page - 1) * limit;
    const providers = await Provider.find()
      .populate("userId", "name email")
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await Provider.countDocuments();

    return NextResponse.json({
      success: true,
      data: providers,
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
    const { userId, businessName, description, location } = body;

    if (!userId || !businessName || !location) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.INVALID_INPUT },
        { status: 400 },
      );
    }

    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // ⭐ 3. CHECK IF PROVIDER ALREADY EXISTS (THIS IS WHERE YOU ADD IT)
    const existingProvider = await Provider.findOne({ userId });

    if (existingProvider) {
      return NextResponse.json(
        { success: false, message: "User already has a provider" },
        { status: 400 },
      );
    }

    const provider = new Provider({
      userId,
      businessName,
      description,
      location,
    });

    await provider.save();

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.CREATE, data: provider },
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
