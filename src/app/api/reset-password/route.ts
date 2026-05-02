import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    const validationError = validatePassword(password);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }
    if (!token || !password) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    await connectDB();

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    console.log("User found for token:", user);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 },
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return NextResponse.json(
      { message: "Password updated successfully", email: user.email },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
