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

export default function ChatThreadList({ threads, loading, activeThreadId, onSelect }: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <MessageCircle size={32} className="text-gray-300" />
        <p className="text-sm font-bold text-gray-400">No tenés conversaciones aún</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {threads.map((t) => {
        const isActive = t.id === activeThreadId;
        const hasUnread = t.unreadCount > 0;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors cursor-pointer ${
              isActive
                ? "bg-urbik-cyan/10 border-l-2 border-l-urbik-cyan"
                : hasUnread
                ? "bg-urbik-cyan/5 hover:bg-gray-50"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-urbik-black text-white flex items-center justify-center font-black text-sm shrink-0">
                {t.otherParty.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-sm text-urbik-black truncate">{t.otherParty}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(t.lastMessageAt)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {t.property ? t.property.title : "Consulta general"}
                </p>
                {hasUnread && (
                  <span className="inline-flex items-center mt-1 bg-urbik-cyan text-urbik-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    {t.unreadCount} nuevo{t.unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
