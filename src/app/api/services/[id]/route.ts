import { connectDB } from "@/lib/db";
import { Service } from "@/lib/schemas/Service.schema";
import { MESSAGES } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const service = await Service.findById(id)
      .populate("providerId", "businessName location")
      .populate("categoryId", "name");

    if (!service) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const service = await Service.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.UPDATE,
      data: service,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.DELETE,
      data: service,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
