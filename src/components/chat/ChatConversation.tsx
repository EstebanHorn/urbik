"use client";
import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";

interface Props {
  threadId: string;
  currentUserId: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatConversation({ threadId, currentUserId }: Props) {
  const { messages, loading, addOptimistic, replaceOptimistic } = useChatMessages(threadId);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || sending) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic = {
      id: tempId,
      thread_id: threadId,
      sender_id: currentUserId,
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    addOptimistic(optimistic);
    setBody("");
    setSending(true);

    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const real = await res.json();
        replaceOptimistic(tempId, { ...optimistic, id: real.id, created_at: real.created_at });
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse font-bold">Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs font-bold text-gray-400 tracking-widest">Empezá la conversación</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 text-sm font-medium leading-relaxed ${
                  isOwn
                    ? "bg-urbik-black text-white rounded-2xl rounded-br-sm"
                    : "bg-gray-100 text-urbik-black rounded-2xl rounded-bl-sm"
                } ${msg.id.startsWith("temp-") ? "opacity-60" : ""}`}
              >
                <p>{msg.body}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? "text-white/50" : "text-gray-400"} text-right`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 flex gap-3 items-end shrink-0">
        <textarea
          rows={2}
          placeholder="Escribí tu mensaje... (Enter para enviar)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-urbik-black transition-colors"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="bg-urbik-cyan text-urbik-black font-black w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
