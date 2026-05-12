import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/uploadFile";
import error from "@/app/error";
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    const imageUrl = await uploadFile(file, bucket);
    return NextResponse.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    console.log(error);
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
      },
      { status: 500 },
    );
  }
}
