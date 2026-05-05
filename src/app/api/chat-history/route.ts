import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ChatHistory } from "@/models/ChatHistory.model";

// GET /api/chat-history — list all conversations for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const history = await ChatHistory.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .select("title createdAt updatedAt")
    .limit(50)
    .lean();

  return NextResponse.json(history);
}

// POST /api/chat-history — save a new conversation
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();
  if (!messages || messages.length < 2) {
    return NextResponse.json({ error: "Too short to save" }, { status: 400 });
  }

  await connectDB();

  const firstUserMsg = messages.find(
    (m: { role: string }) => m.role === "user",
  );
  const title = firstUserMsg
    ? firstUserMsg.content.slice(0, 60) +
      (firstUserMsg.content.length > 60 ? "…" : "")
    : "New conversation";

  const chat = await ChatHistory.create({
    userId: session.user.id,
    title,
    messages,
  });

  return NextResponse.json({ id: chat._id }, { status: 201 });
}
