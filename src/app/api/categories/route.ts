import { connectDB } from "@/lib/db";
import { Category } from "@/lib/schemas/Category.schema";
import { MESSAGES, PAGINATION } from "@/constants/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT)
    );

    const skip = (page - 1) * limit;
    const categories = await Category.find().skip(skip).limit(limit).exec();
    const total = await Category.countDocuments();

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, description, icon, slug } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: MESSAGES.ERROR.INVALID_INPUT },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      description,
      icon,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    });

    await category.save();

    return NextResponse.json(
      { success: true, message: MESSAGES.SUCCESS.CREATE, data: category },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: MESSAGES.ERROR.SERVER_ERROR, error: error.message },
      { status: 500 }
    );
  }
}
