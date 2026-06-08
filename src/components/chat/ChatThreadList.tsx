"use client";
import React from "react";
import { MessageCircle } from "lucide-react";
import type { ChatThread } from "@/hooks/useChatThreads";

interface Props {
  threads: ChatThread[];
  loading: boolean;
  activeThreadId: string | null;
  onSelect: (id: string) => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const AVATAR_COLORS = [
  "bg-urbik-black",
  "bg-slate-700",
  "bg-zinc-700",
  "bg-neutral-700",
  "bg-stone-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ChatThreadList({ threads, loading, activeThreadId, onSelect }: Props) {
  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <MessageCircle size={22} className="text-gray-300" />
        </div>
        <p className="text-xs font-bold text-gray-400">Sin conversaciones aún</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full py-1.5">
      {threads.map((t) => {
        const isActive = t.id === activeThreadId;
        const hasUnread = t.unreadCount > 0;
        const initial = t.otherParty.charAt(0).toUpperCase();
        const color = avatarColor(t.otherParty);

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`w-full text-left px-3 py-2.5 mx-0 rounded-xl transition-all cursor-pointer flex items-start gap-3 relative ${
              isActive
                ? "bg-urbik-black text-white mx-2 w-[calc(100%-16px)]"
                : hasUnread
                ? "hover:bg-gray-100/80 mx-1 w-[calc(100%-8px)]"
                : "hover:bg-gray-100/60 mx-1 w-[calc(100%-8px)]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 text-white ${
                isActive ? "bg-white/20" : color
              }`}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`font-black text-sm truncate ${
                    isActive ? "text-white" : "text-urbik-black"
                  }`}
                >
                  {t.otherParty}
                </span>
                <span
                  className={`text-[10px] shrink-0 ${
                    isActive ? "text-white/50" : "text-gray-400"
                  }`}
                >
                  {timeAgo(t.lastMessageAt)}
                </span>
              </div>
              <p
                className={`text-xs truncate mt-0.5 ${
                  isActive ? "text-white/60" : "text-gray-400"
                }`}
              >
                {t.property ? t.property.title : "Consulta general"}
              </p>
              {hasUnread && !isActive && (
                <span className="inline-flex items-center mt-1 bg-urbik-cyan text-urbik-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  {t.unreadCount} nuevo{t.unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
