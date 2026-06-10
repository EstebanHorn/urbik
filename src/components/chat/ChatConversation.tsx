"use client";
import React, { useEffect, useRef, useState } from "react";
import { Send, Check, CheckCheck, Clock } from "lucide-react";
import { useChatMessages, type ChatMessage } from "@/hooks/useChatMessages";

interface Props {
  threadId: string;
  currentUserId: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

function MessageStatus({ msg }: { msg: ChatMessage }) {
  if (msg.id.startsWith("temp-")) return <Clock size={10} className="text-white/40 shrink-0" />;
  if (msg.read_at) return <CheckCheck size={11} className="text-urbik-cyan shrink-0" />;
  return <Check size={11} className="text-white/50 shrink-0" />;
}

export default function ChatConversation({ threadId, currentUserId }: Props) {
  const { messages, loading, addOptimistic, replaceOptimistic } = useChatMessages(threadId);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevCountRef = useRef(0);

  // Instant scroll on thread switch, smooth on new message
  useEffect(() => {
    prevCountRef.current = 0;
  }, [threadId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    const isNewMsg = prevCountRef.current > 0 && messages.length > prevCountRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: isNewMsg ? "smooth" : "instant" });
    prevCountRef.current = messages.length;
  }, [messages]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || sending) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    addOptimistic({
      id: tempId,
      thread_id: threadId,
      sender_id: currentUserId,
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    });
    setBody("");
    setSending(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const real = await res.json();
        replaceOptimistic(tempId, {
          id: real.id,
          thread_id: threadId,
          sender_id: currentUserId,
          body: text,
          created_at: real.created_at,
          read_at: null,
        });
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-urbik-black/20 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  let lastDateLabel = "";

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[11px] font-bold text-gray-300 tracking-widest uppercase">
              Empezá la conversación
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.sender_id === currentUserId;
          const dateLabel = formatDateLabel(msg.created_at);
          const showDate = dateLabel !== lastDateLabel;
          lastDateLabel = dateLabel;

          const prevMsg = messages[i - 1];
          const nextMsg = messages[i + 1];
          const sameSenderAsPrev = !showDate && prevMsg?.sender_id === msg.sender_id;
          const sameSenderAsNext = nextMsg?.sender_id === msg.sender_id;

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-3 py-3 my-1">
                  <div className="flex-1 h-px bg-gray-200/80" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-gray-200/80" />
                </div>
              )}

              <div
                className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                  sameSenderAsPrev ? "mt-0.5" : "mt-2.5"
                }`}
              >
                <div
                  className={`
                    max-w-[70%] px-3.5 py-2 text-sm font-medium leading-relaxed
                    ${isOwn
                      ? `bg-urbik-black text-white rounded-2xl ${sameSenderAsNext ? "rounded-br-md" : "rounded-br-sm"}`
                      : `bg-white border border-gray-100 text-urbik-black shadow-sm rounded-2xl ${sameSenderAsNext ? "rounded-bl-md" : "rounded-bl-sm"}`
                    }
                    ${msg.id.startsWith("temp-") ? "opacity-50" : ""}
                  `}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] leading-none tabular-nums ${isOwn ? "text-white/35" : "text-gray-400"}`}>
                      {formatTime(msg.created_at)}
                    </span>
                    {isOwn && <MessageStatus msg={msg} />}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-3 flex gap-2 items-end shrink-0">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Escribí tu mensaje..."
          value={body}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none bg-gray-50 border border-transparent rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 transition-all placeholder:text-gray-400 overflow-hidden"
          style={{ lineHeight: "1.55", minHeight: "42px" }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="text-urbik-black w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-20 hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}
