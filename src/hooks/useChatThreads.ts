"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChatThread = {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  property: { id: string; title: string; image: string | null } | null;
  otherParty: string;
  unreadCount: number;
};

const POLL_INTERVAL = 8000;

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/threads");
      if (res.ok) {
        const data = await res.json();
        setThreads(Array.isArray(data) ? data : []);
      } else {
        console.error("[useChatThreads] GET /api/chat/threads →", res.status);
      }
    } catch (err) {
      console.error("[useChatThreads] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    intervalRef.current = setInterval(fetchThreads, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchThreads]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0);

  return { threads, loading, totalUnread, refetch: fetchThreads };
}
