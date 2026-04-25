{
  /*import { withApiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { MESSAGES } from "@/constants/config";
import * as userService from "@/services/user.service";
import { createUserSchema } from "@/lib/validations/user.validation";

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const validated = createUserSchema.parse(body);
  const user = await userService.createUser(validated);
  return Response.json(successResponse(user, MESSAGES.SUCCESS.CREATE), { status: 201 });
});*/
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {User} from "@/models/User.model";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating user", error },
      { status: 500 },
    );
  }
}
