"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ChatThread = {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  property: { id: number; title: string; image: string | null } | null;
  otherParty: string;
  unreadCount: number;
};

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null);

  const fetchThreads = useCallback(async () => {
    const res = await fetch("/api/chat/threads");
    if (res.ok) {
      const data = await res.json();
      setThreads(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`chat:threads:mine:${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => {
        fetchThreads();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        fetchThreads();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [fetchThreads]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0);

  return { threads, loading, totalUnread, refetch: fetchThreads };
}
