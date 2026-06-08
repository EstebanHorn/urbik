"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export function useChatMessages(threadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null);

  useEffect(() => {
    if (!threadId) { setMessages([]); return; }
    setLoading(true);
    fetch(`/api/chat/threads/${threadId}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [threadId]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!threadId) return;

    const channel = supabase
      .channel(`chat:thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, read_at: updated.read_at } : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [threadId]);

  const addOptimistic = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const replaceOptimistic = (tempId: string, real: ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === tempId ? real : m)));
  };

  return { messages, loading, addOptimistic, replaceOptimistic };
}
