import { connectDB } from "@/lib/db";
import { Provider } from "@/lib/schemas/Provider.schema";
import { MESSAGES } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const provider = await Provider.findById(id).populate("userId", "name email");

    if (!provider) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: provider });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const provider = await Provider.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.UPDATE,
      data: provider,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const provider = await Provider.findByIdAndDelete(id);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.DELETE,
      data: provider,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
        error: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
