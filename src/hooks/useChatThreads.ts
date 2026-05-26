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
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel("chat:threads:mine")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => {
        fetchThreads();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        fetchThreads();
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchThreads]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0);

  return { threads, loading, totalUnread, refetch: fetchThreads };
}
