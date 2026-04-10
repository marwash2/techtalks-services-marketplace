import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User.model";  

// POST request handler for signup + login
export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { action, email, password, role } = body;

  if (action === "signup") {
    //  Signup logic
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "user", // default role if not provided
    });

    await newUser.save();
    return NextResponse.json({ message: "Signup successful", user: newUser });
  }

  if (action === "login") {
    //  Login logic
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful", user });
  }

  // If action is missing or invalid
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}