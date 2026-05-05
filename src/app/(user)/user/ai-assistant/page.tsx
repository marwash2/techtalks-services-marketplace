"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  SquarePen,
  Star,
} from "lucide-react";
import { Concierge } from "@/components/ai/Concierge";
import WelcomeModal from "@/components/ai/WelcomeModal";
import ChatHistoryPanel from "@/components/ai/ChatHistoryPanel";

const STARTER_PROMPTS = [
  "I need a plumber urgently in Beirut",
  "Find me a math tutor for my child in Tripoli",
  "Book a home cleaning service this week",
  "I need a doctor for a home visit tomorrow",
];

const FEATURE_PILLS = [
  { icon: Zap, label: "Instant matches" },
  { icon: Shield, label: "Verified providers only" },
  { icon: MessageSquare, label: "Ask follow-up questions" },
];

const RATING_FILTERS = [
  { label: "All ratings", value: 0 },
  { label: "3+ ★", value: 3 },
  { label: "4+ ★", value: 4 },
  { label: "4.5+ ★", value: 4.5 },
];

type Tab = "chat" | "history";

export default function AiAssistantPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const [chatKey, setChatKey] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [loadedMessages, setLoadedMessages] = useState<
    { role: "user" | "assistant"; content: string }[] | undefined
  >();

  function handleLoadHistory(
    messages: { role: "user" | "assistant"; content: string }[],
  ) {
    setLoadedMessages(messages);
    setTab("chat");
  }

  return (
    <div className="space-y-6">
      <WelcomeModal />

      {/* Page header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
            <p className="mt-1 text-sm text-slate-500">
              Describe what you need in plain language — the assistant will find
              the best verified providers for you and explain why each one fits.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FEATURE_PILLS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  <Icon className="h-3 w-3 text-blue-500" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rating filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mr-1">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          Filter by rating:
        </div>
        {RATING_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setMinRating(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              minRating === f.value
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tab switcher + content */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center border-b border-slate-100">
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "chat"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            History
          </button>
          <div className="ml-auto px-4">
            <button
              onClick={() => {
                setLoadedMessages(undefined);
                setChatKey((k) => k + 1);
                setTab("chat");
              }}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <SquarePen className="h-3.5 w-3.5" />
              New Chat
            </button>
          </div>
        </div>

        {tab === "chat" ? (
          <Concierge
            key={chatKey}
            endpoint="/api/ai"
            brandName="Smart Concierge"
            brandTagline="Powered by AI — finds the right pro for you"
            starterPrompts={STARTER_PROMPTS}
            initialMessages={loadedMessages}
            minRating={minRating}
          />
        ) : (
          <ChatHistoryPanel onLoad={handleLoadHistory} />
        )}
      </div>

      {/* Tips card */}
      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-900">
            Tips for better results
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-blue-800">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            Mention your <strong>city</strong> — &quot;I need a plumber in
            Beirut&quot; gets faster results
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            Share your <strong>budget</strong> — &quot;under $100&quot; helps
            narrow down the right tier
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            Mention <strong>urgency</strong> — &quot;today&quot; prioritizes
            fast-response providers
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            Use the <strong>rating filter</strong> above to see only top-rated
            services
          </li>
        </ul>
      </div>
    </div>
  );
}
