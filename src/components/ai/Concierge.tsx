"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Star,
  MapPin,
  Heart,
  ShieldCheck,
  Clock,
  Tag,
  CalendarCheck,
} from "lucide-react";
import type {
  AssistantTurn,
  ChatMessage,
  ChatResponse,
  Service,
  Turn,
} from "@/types/concierge";

function useFavorites() {
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/favorites?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const items = data.data?.favorites ?? data.favorites ?? [];
        const ids = new Set<string>(
          items
            .map((item: { service?: { id?: string } | string }) => {
              if (!item.service || typeof item.service === "string")
                return null;
              return (item.service as { id?: string }).id;
            })
            .filter(Boolean) as string[],
        );
        setFavoritedIds(ids);
      })
      .catch(() => {});
  }, []);

  const toggle = async (serviceId: string) => {
    if (!serviceId || toggling.has(serviceId)) return;
    setToggling((prev) => new Set(prev).add(serviceId));
    const isFavorited = favoritedIds.has(serviceId);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      isFavorited ? next.delete(serviceId) : next.add(serviceId);
      return next;
    });
    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${serviceId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId }),
        });
      }
    } catch {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        isFavorited ? next.add(serviceId) : next.delete(serviceId);
        return next;
      });
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    }
  };

  return { favoritedIds, toggle, toggling };
}

interface ConciergeProps {
  endpoint?: string;
  welcome?: string;
  starterPrompts?: string[];
  brandName?: string;
  brandTagline?: string;
  initialMessages?: { role: "user" | "assistant"; content: string }[];
  minRating?: number;
}

export function Concierge({
  endpoint = "/api/ai",
  welcome = "Marhaba! Tell me what service you need and I'll match you with the right pro.",
  starterPrompts = [],
  brandName = "Smart Concierge",
  brandTagline = "Powered by AI — finds the right pro for you",
  initialMessages,
  minRating = 0,
}: ConciergeProps) {
  const [turns, setTurns] = useState<Turn[]>(
    initialMessages && initialMessages.length > 0
      ? initialMessages.map((m) => ({
          role: m.role,
          content: m.content,
          followUpQuestions: [],
          recommendedProviders: [],
          providers: [],
        }))
      : [
          {
            role: "assistant",
            content: welcome,
            followUpQuestions: [],
            recommendedProviders: [],
            providers: [],
          },
        ],
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { favoritedIds, toggle, toggling } = useFavorites();

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, pending]);

  async function sendMessage(text: string) {
    const userText = text.trim();
    if (!userText || pending) return;

    const newTurns: Turn[] = [...turns, { role: "user", content: userText }];
    setTurns(newTurns);
    setInput("");
    setPending(true);

    const history: ChatMessage[] = newTurns.map((t) => ({
      role: t.role,
      content: t.content,
    }));

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();

      const assistant: AssistantTurn = {
        role: "assistant",
        content: data.finalMessage,
        followUpQuestions: data.followUpQuestions ?? [],
        recommendedProviders: data.recommendedProviders ?? [],
        providers: (data.services ?? []) as Service[],
      };
      setTurns((prev) => [...prev, assistant]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I had trouble reaching the service. Please try again in a moment.",
          followUpQuestions: [],
          recommendedProviders: [],
          providers: [],
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-full max-h-[720px] min-h-[520px] bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-100 px-5 py-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100">
          <Sparkles className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-slate-900 text-sm leading-tight">
            {brandName}
          </div>
          <div className="text-xs text-slate-500">{brandTagline}</div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
      >
        {turns.map((turn, i) => (
          <Message
            key={i}
            turn={turn}
            onChip={sendMessage}
            pending={pending}
            favoritedIds={favoritedIds}
            onToggleFavorite={toggle}
            toggling={toggling}
            minRating={minRating}
          />
        ))}

        {/* Starter prompts */}
        {turns.length === 1 && starterPrompts.length > 0 && (
          <div className="pt-1">
            <div className="text-xs text-slate-400 text-center mb-3">
              Or try asking
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {starterPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  disabled={pending}
                  className="text-sm px-4 py-2 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 text-slate-600 transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {pending && (
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: "240ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-100 px-4 py-3 flex items-center gap-2 bg-white"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you need..."
          disabled={pending}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-full px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 disabled:opacity-40 transition-colors"
          aria-label="Send"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}

function Message({
  turn,
  onChip,
  pending,
  favoritedIds,
  onToggleFavorite,
  toggling,
  minRating = 0,
}: {
  turn: Turn;
  onChip: (text: string) => void;
  pending: boolean;
  favoritedIds: Set<string>;
  onToggleFavorite: (serviceId: string) => void;
  toggling: Set<string>;
  minRating?: number;
}) {
  if (turn.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed">
          {turn.content}
        </div>
      </div>
    );
  }

  const assistantTurn = turn as AssistantTurn;
  const filteredServices = (assistantTurn.providers ?? []).filter(
    (s) => minRating === 0 || (s.providerId?.rating ?? 0) >= minRating,
  );

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap">
        {turn.content}
      </div>

      {assistantTurn.providers && assistantTurn.providers.length > 0 && (
        <div className="grid gap-3">
          {filteredServices.map((service) => {
            const reason = assistantTurn.recommendedProviders.find(
              (r) => r.id === service._id,
            )?.reason;
            return (
              <ServiceCard
                key={service._id}
                service={service}
                reason={reason}
                favoritedIds={favoritedIds}
                toggling={toggling}
                onToggleFavorite={onToggleFavorite}
              />
            );
          })}

          {filteredServices.length === 0 && (
            <p className="text-xs text-slate-400 italic pl-1">
              No services match the current rating filter. Try lowering the
              minimum rating.
            </p>
          )}
        </div>
      )}

      {assistantTurn.followUpQuestions &&
        assistantTurn.followUpQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assistantTurn.followUpQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onChip(q)}
                disabled={pending}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
    </div>
  );
}

function ServiceCard({
  service,
  reason,
  favoritedIds,
  toggling,
  onToggleFavorite,
}: {
  service: Service;
  reason?: string;
  favoritedIds: Set<string>;
  toggling: Set<string>;
  onToggleFavorite: (serviceId: string) => void;
}) {
  const router = useRouter();
  const isFavorited = favoritedIds.has(service._id);
  const isToggling = toggling.has(service._id);
  const provider = service.providerId;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
      {service.image && (
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-32 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        {/* Title + heart */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 leading-tight">
              {service.title}
            </h3>
            {provider && (
              <p className="text-xs text-slate-500 mt-0.5">
                by {provider.businessName}
              </p>
            )}
          </div>
          <button
            onClick={() => onToggleFavorite(service._id)}
            disabled={isToggling}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 shrink-0"
            aria-label={
              isFavorited ? "Remove from favorites" : "Save to favorites"
            }
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? "fill-rose-500 text-rose-500" : "text-slate-400"
              }`}
            />
          </button>
        </div>

        {/* Price + duration + location */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full px-2.5 py-1">
            ${service.price}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3" />
            {service.duration} min
          </span>
          {service.location && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">
              <MapPin className="w-3 h-3" />
              {service.location}
            </span>
          )}
        </div>

        {/* Rating + verified */}
        {provider && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium">{provider.rating?.toFixed(1)}</span>
              <span className="text-slate-400">({provider.totalReviews})</span>
            </div>
            {provider.isVerified && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CalendarCheck className="w-3 h-3 text-green-500" />
          {service.availability}
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI reason */}
        {reason && (
          <div className="text-xs bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-slate-700">
            <span className="font-semibold text-blue-600">Why this fits: </span>
            {reason}
          </div>
        )}

        {/* Book Now */}
        <button
          onClick={() => router.push(`/user/bookings/${service._id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
