import { NextRequest, NextResponse } from "next/server";
import { processChatMessage } from "@/services/ai.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ChatHistory } from "@/models/ChatHistory.model";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const result = await processChatMessage(messages);

    // Auto-save conversation to history (never blocks the response)
    const session = await getServerSession(authOptions);
    if (session?.user?.id && result.finalMessage) {
      const fullMessages = [
        ...messages,
        { role: "assistant", content: result.finalMessage },
      ];
      const firstUserMsg = messages.find(
        (m: { role: string }) => m.role === "user",
      );
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) +
          (firstUserMsg.content.length > 60 ? "…" : "")
        : "New conversation";

      connectDB()
        .then(() =>
          ChatHistory.updateOne(
            { userId: session.user.id, title },
            { $set: { messages: fullMessages, title } },
            { upsert: true },
          ),
        )
        .catch(() => {}); // silently ignore — never fail the AI response
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[AI route error]", err);
    return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
  }
}
