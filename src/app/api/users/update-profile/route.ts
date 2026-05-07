import { NextResponse } from "next/server";
import { User } from "@/models/User.model";
import { connectDB } from "@/lib/db";
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, avatar } = body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        avatar,
      },
      { new: true },
    );
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Update failed",
      },
      { status: 500 },
    );
  }
}
