import { NextResponse } from "next/server";
import { Service } from "@/models/Service.model";
import { connectDB } from "@/lib/db";
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, image, providerId } = body;
    const service = await Service.create({
      title,
      description,
      image,
      provider: providerId,
    });
    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Service creation failed",
      },
      { status: 500 },
    );
  }
}
