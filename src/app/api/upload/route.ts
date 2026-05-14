import { NextResponse } from "next/server";
import { uploadFileWithPath } from "@/lib/uploadFile";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-utils";
import { User } from "@/models/User.model";
import { Provider } from "@/models/Provider.model";
import { Service } from "@/models/Service.model";

async function persistUploadTarget({
  target,
  id,
  url,
  sessionUserId,
  sessionRole,
}: {
  target: string;
  id: string;
  url: string;
  sessionUserId: string;
  sessionRole?: string;
}) {
  if (!target || !id) return;

  await connectDB();

  if (target === "user") {
    if (id !== sessionUserId && sessionRole !== "admin") {
      throw new Error("Unauthorized avatar update");
    }
    await User.findByIdAndUpdate(id, { avatar: url }, { new: true });
    return;
  }

  if (target === "provider") {
    const provider = await Provider.findById(id).select("userId");
    if (!provider) throw new Error("Provider not found");
    if (String(provider.userId) !== sessionUserId && sessionRole !== "admin") {
      throw new Error("Unauthorized provider avatar update");
    }
    await Provider.findByIdAndUpdate(id, { avatar: url }, { new: true });
    return;
  }

  if (target === "service") {
    const service = await Service.findById(id).select("providerId");
    if (!service) throw new Error("Service not found");

    const provider = await Provider.findById(service.providerId).select(
      "userId",
    );
    if (!provider) throw new Error("Provider not found");
    if (String(provider.userId) !== sessionUserId && sessionRole !== "admin") {
      throw new Error("Unauthorized service image update");
    }
    await Service.findByIdAndUpdate(id, { image: url }, { new: true });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const target = String(formData.get("target") || "");
    const id = String(
      formData.get("id") ||
        formData.get("userId") ||
        formData.get("providerId") ||
        formData.get("serviceId") ||
        "",
    );

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "No bucket provided" },
        { status: 400 },
      );
    }

    const uploaded = await uploadFileWithPath(file, bucket);

    await persistUploadTarget({
      target,
      id,
      url: uploaded.url,
      sessionUserId: session.user.id,
      sessionRole: session.user.role,
    });

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      path: uploaded.path,
    });
  } catch (error) {
    console.log(error);
    console.error("UPLOAD ERROR:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message.toLowerCase().includes("unauthorized") ? 403 : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}
