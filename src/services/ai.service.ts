import { groq } from "@/lib/groq";
import { SYSTEM_PROMPT } from "@/lib/ai-prompt";
import { Service } from "@/models/Service.model";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  intent: string;
  followUpQuestions: string[];
  recommendedProviders: { id: string; title: string; reason: string }[];
  finalMessage: string;
  services: unknown[];
}

// Search services (not providers) by title, description, tags, location
async function retrieveContext(message: string) {
  await connectDB();

  const tokens = message
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length >= 3)
    .slice(0, 8);

  const query = tokens.length
    ? {
        isActive: true,
        $or: tokens.flatMap((t) => {
          const r = new RegExp(t, "i");
          return [
            { title: r },
            { description: r },
            { tags: r },
            { location: r },
            { availability: r },
          ];
        }),
      }
    : { isActive: true };

  return await Service.find(query)
    .populate(
      "providerId",
      "businessName rating totalReviews isVerified description location", // ← added description + location
    )
    .populate("categoryId", "name")
    .limit(20)
    .lean();
}

function summarize(s: Record<string, unknown>): string {
  const provider = s.providerId as Record<string, unknown> | null;
  const category = s.categoryId as Record<string, unknown> | null;

  return [
    `id:${s._id}`,
    `title:${s.title}`,
    `description:${s.description ?? ""}`,
    `price:$${s.price}`,
    `duration:${s.duration} mins`,
    `location:${s.location ?? "flexible"}`,
    `tags:${(s.tags as string[])?.join(", ")}`,
    `availability:${s.availability}`,
    `category:${(category as Record<string, unknown>)?.name ?? ""}`,
    `provider_name:${provider?.businessName ?? ""}`,
    `provider_description:${provider?.description ?? ""}`, // ← NEW
    `provider_location:${provider?.location ?? ""}`, // ← NEW
    `provider_rating:${provider?.rating ?? "N/A"} (${provider?.totalReviews ?? 0} reviews)`,
    `provider_verified:${provider?.isVerified ?? false}`,
  ].join(" | ");
}
export async function processChatMessage(
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const latestUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const candidates = await retrieveContext(latestUser);
  const context = candidates.map(summarize).join("\n");

  const groqMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const last = groqMessages[groqMessages.length - 1];
  if (last.role === "user") {
    last.content += `\n\n---\nAVAILABLE SERVICES (recommend ONLY from this list, use the exact id field):\n${context}\n\nReply with strict JSON only.`;
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...groqMessages],
    temperature: 0.4,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      intent: "",
      followUpQuestions: [],
      recommendedProviders: [],
      finalMessage: text || "I'm here to help. What service do you need?",
      services: [],
    };
  }

  // Support both key names in case the AI uses either
  const rawRecs =
    parsed.recommended_providers ?? parsed.recommended_services ?? [];

  const recIds = rawRecs.map((r: { id: string }) => r.id);

  await connectDB();

  const validIds = recIds.filter((id: string) =>
    mongoose.Types.ObjectId.isValid(id),
  );

  const recServices = validIds.length
    ? await Service.find({ _id: { $in: validIds } })
        .populate("providerId", "businessName rating totalReviews isVerified")
        .populate("categoryId", "name")
        .lean()
    : [];

  return {
    intent: parsed.intent ?? "",
    followUpQuestions: parsed.follow_up_questions ?? [],
    recommendedProviders: rawRecs.filter((r: { id: string }) =>
      recServices.some((s: Record<string, unknown>) => String(s._id) === r.id),
    ),
    finalMessage: parsed.final_message ?? "",
    services: recServices,
  };
}
