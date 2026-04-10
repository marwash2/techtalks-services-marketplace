import { connectDB } from "@/lib/db";
import { Review } from "@/lib/schemas/Review.schema";
import { MESSAGES } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const review = await Review.findById(params.id).populate(
      "userId providerId serviceId"
    );

    if (!review) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const review = await Review.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.UPDATE,
      data: review,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const review = await Review.findByIdAndDelete(params.id);

    if (!review) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.DELETE,
      data: review,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}
