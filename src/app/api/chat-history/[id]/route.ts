import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ChatHistory } from "@/models/ChatHistory.model";

// GET /api/chat-history/[id] — load a specific conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const chat = await ChatHistory.findOne({
    _id: params.id,
    userId: session.user.id,
  }).lean();

  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(chat);
}

// DELETE /api/chat-history/[id] — delete a conversation
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  await ChatHistory.deleteOne({ _id: params.id, userId: session.user.id });

  return NextResponse.json({ success: true });
}
