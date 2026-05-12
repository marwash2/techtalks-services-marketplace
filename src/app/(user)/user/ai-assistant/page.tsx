"use client";

import { useState } from "react";

import {
  Bot,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Clock3,
  SquarePen,
  Star,
  Zap,
  History,
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
  {
    icon: Zap,
    label: "Instant matches",
  },
  {
    icon: ShieldCheck,
    label: "Verified providers",
  },
  {
    icon: MessageSquare,
    label: "Smart AI conversations",
  },
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

  const [loadedMessages, setLoadedMessages] =
    useState<
      {
        role: "user" | "assistant";
        content: string;
      }[]
    >();

  function handleLoadHistory(
    messages: {
      role: "user" | "assistant";
      content: string;
    }[]
  ) {
    setLoadedMessages(messages);
    setTab("chat");
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <WelcomeModal />

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">

          {/* Decorative Blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative">

            {/* TAG */}
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <Bot className="w-3 h-3" />
              AI Assistant
            </span>

            {/* TITLE */}
            <h1
              className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
              style={{
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              Smart Concierge Assistant
            </h1>

            {/* DESCRIPTION */}
            <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-2xl mb-6">
              Describe what you need in plain language
              and the AI assistant will instantly match
              you with the best verified providers.
            </p>

            {/* FEATURE PILLS */}
            <div className="flex flex-wrap gap-2.5">

              {FEATURE_PILLS.map(
                ({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]"
                  >
                    <Icon className="w-4 h-4 text-blue-500" />
                    {label}
                  </span>
                )
              )}

            </div>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* LEFT */}
            <div>

              <h2
                className="text-2xl text-[#1e3a5f] mb-1"
                style={{
                  fontFamily:
                    "'DM Serif Display', serif",
                }}
              >
                Smart Search Filters
              </h2>

              <p className="text-sm text-[#6b93c4]">
                Filter providers by rating before
                starting your AI conversation.
              </p>

            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-1 text-xs font-semibold text-[#6b93c4] mr-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Minimum Rating
              </div>

              {RATING_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() =>
                    setMinRating(f.value)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                    minRating === f.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-[#4b6fa8] border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}

            </div>
          </div>
        </section>

        {/* MAIN CHAT CARD */}
        <section className="bg-white border-[1.5px] border-blue-100 rounded-3xl overflow-hidden">

          {/* TOP BAR */}
          <div className="flex items-center border-b border-blue-100 px-3">

            {/* CHAT TAB */}
            <button
              onClick={() => setTab("chat")}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all ${
                tab === "chat"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-[#6b93c4] hover:text-[#1e3a5f]"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>

            {/* HISTORY TAB */}
            <button
              onClick={() => setTab("history")}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all ${
                tab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-[#6b93c4] hover:text-[#1e3a5f]"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>

            {/* NEW CHAT BUTTON */}
            <div className="ml-auto py-3 pr-2">

              <button
                onClick={() => {
                  setLoadedMessages(undefined);
                  setChatKey((k) => k + 1);
                  setTab("chat");
                }}
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition rounded-2xl px-4 py-2 text-sm font-medium text-blue-600"
              >
                <SquarePen className="w-4 h-4" />
                New Chat
              </button>

            </div>
          </div>

          {/* CONTENT */}
          <div className="p-4">

            {tab === "chat" ? (
              <Concierge
                key={chatKey}
                endpoint="/api/ai"
                brandName="Smart Concierge"
                brandTagline="Powered by AI — finds the right provider for you"
                starterPrompts={STARTER_PROMPTS}
                initialMessages={loadedMessages}
                minRating={minRating}
              />
            ) : (
              <ChatHistoryPanel
                onLoad={handleLoadHistory}
              />
            )}

          </div>
        </section>

        {/* TIPS SECTION */}
        <section className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2
                className="text-2xl text-[#1e3a5f]"
                style={{
                  fontFamily:
                    "'DM Serif Display', serif",
                }}
              >
                Tips for Better Results
              </h2>

              <p className="text-sm text-[#6b93c4]">
                Improve your AI search experience
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {[
              {
                title: "Mention your city",
                desc: 'Example: "I need a plumber in Beirut"',
              },
              {
                title: "Include your budget",
                desc: 'Example: "under $100"',
              },
              {
                title: "Mention urgency",
                desc: 'Example: "I need it today"',
              },
              {
                title: "Use rating filters",
                desc: "Show only top-rated providers",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="bg-blue-50 border border-blue-100 rounded-2xl p-5"
              >

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#1e3a5f] mb-1">
                      {tip.title}
                    </h3>

                    <p className="text-sm text-[#6b93c4] leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </section>
      </div>
    </div>
  );
}