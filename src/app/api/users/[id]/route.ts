import { connectDB } from "@/lib/db";
import { User } from "@/lib/schemas/User.schema";
import { MESSAGES } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
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
    const user = await User.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.UPDATE,
      data: user,
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

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.DELETE,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}
