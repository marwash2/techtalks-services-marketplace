"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, MessageSquare, ChevronRight } from "lucide-react";

interface HistoryItem {
  _id: string;
  title: string;
  createdAt: string;
}

interface Props {
  onLoad: (messages: { role: "user" | "assistant"; content: string }[]) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChatHistoryPanel({ onLoad }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chat-history")
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleLoad(id: string) {
    const res = await fetch(`/api/chat-history/${id}`);
    const data = await res.json();
    if (data.messages) onLoad(data.messages);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/chat-history/${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((h) => h._id !== id));
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 rounded-2xl bg-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 mb-3">
          <MessageSquare className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">
          No conversations yet
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Start chatting and your history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {history.map((item) => (
        <div
          key={item._id}
          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 group transition-colors"
        >
          <button
            onClick={() => handleLoad(item._id)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-medium text-slate-800 truncate">
              {item.title}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Clock className="h-3 w-3" />
              {timeAgo(item.createdAt)}
            </p>
          </button>

          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />

          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleting === item._id}
            className="shrink-0 p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Delete conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
