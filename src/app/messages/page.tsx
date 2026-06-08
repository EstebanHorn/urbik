"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChatThreads } from "@/hooks/useChatThreads";
import ChatThreadList from "@/components/chat/ChatThreadList";
import ChatConversation from "@/components/chat/ChatConversation";
import { MessageCircle, ArrowLeft, Home } from "lucide-react";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    searchParams.get("thread")
  );
  const [showConversation, setShowConversation] = useState(!!searchParams.get("thread"));

  const { threads, loading, totalUnread } = useChatThreads();

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        setCurrentUserId(data.session?.user.id ?? null);
        setAuthLoading(false);
      });
  }, []);

  const handleSelect = (id: string) => {
    setActiveThreadId(id);
    setShowConversation(true);
    window.history.replaceState({}, "", `/messages?thread=${id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center">
          <MessageCircle size={28} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-urbik-black tracking-tight">
            Iniciá sesión para ver tus mensajes
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Accedé a tus consultas y conversaciones
          </p>
        </div>
        <Link
          href="/auth/login?redirect=/messages"
          className="bg-urbik-black text-white font-black px-8 py-3.5 rounded-full hover:bg-urbik-dark2 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-display font-black text-urbik-black tracking-tighter">
            Mensajes
          </h1>
          {totalUnread > 0 && (
            <span className="bg-urbik-cyan text-urbik-black text-xs font-black px-2.5 py-1 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        <div className="border border-gray-100 rounded-3xl overflow-hidden flex h-[75vh] shadow-md">
          {/* Sidebar */}
          <div
            className={`w-full md:w-72 shrink-0 border-r border-gray-100 flex flex-col bg-white ${
              showConversation ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="px-4 py-3.5 border-b border-gray-100 shrink-0">
              <p className="font-black text-[10px] text-gray-400 tracking-widest uppercase">
                Conversaciones
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <ChatThreadList
                threads={threads}
                loading={loading}
                activeThreadId={activeThreadId}
                onSelect={handleSelect}
              />
            </div>
          </div>

          {/* Conversation panel */}
          <div className={`flex-1 flex flex-col ${showConversation ? "flex" : "hidden md:flex"}`}>
            {activeThreadId && currentUserId ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 bg-white shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConversation(false)}
                    className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <div
                    className="w-8 h-8 rounded-full bg-urbik-black text-white flex items-center justify-center font-black text-xs shrink-0"
                  >
                    {(activeThread?.otherParty ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-urbik-black truncate">
                      {activeThread?.otherParty ?? "Conversación"}
                    </p>
                    {activeThread?.property ? (
                      <Link
                        href={`/property/${activeThread.property.id}`}
                        className="text-[11px] text-urbik-cyan hover:underline flex items-center gap-1"
                      >
                        <Home size={10} />
                        {activeThread.property.title}
                      </Link>
                    ) : (
                      <p className="text-[11px] text-gray-400">Consulta general</p>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatConversation
                    threadId={activeThreadId}
                    currentUserId={currentUserId}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center">
                  <MessageCircle size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">
                  {threads.length > 0
                    ? "Seleccioná una conversación"
                    : "Todavía no iniciaste ninguna consulta"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
