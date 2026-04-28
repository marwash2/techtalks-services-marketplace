import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User.model";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 },
      );
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 15); // 1 hour
    await user.save();
    const resetLink = `http://localhost:3000/reset-password?token=${rawToken}`;

    await resend.emails.send({
      from: `onboarding@resend.dev`,
      to: `khidmati.lb@gmail.com`,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json(
      { message: "Reset email sent successfully", resetLink },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in forgot-password API:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
