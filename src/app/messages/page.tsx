"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChatThreads } from "@/hooks/useChatThreads";
import ChatThreadList from "@/components/chat/ChatThreadList";
import ChatConversation from "@/components/chat/ChatConversation";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    searchParams.get("thread")
  );
  const [showConversation, setShowConversation] = useState(!!searchParams.get("thread"));

  const { threads, loading } = useChatThreads();

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
        <div className="h-8 w-48 bg-gray-100 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <MessageCircle size={48} className="text-gray-300" />
        <p className="text-lg font-black text-urbik-black">Iniciá sesión para ver tus mensajes</p>
        <Link
          href="/auth/login?redirect=/messages"
          className="bg-urbik-black text-white font-black px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
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
        <h1 className="text-3xl font-display font-black text-urbik-black tracking-tighter mb-6">
          Mis mensajes
        </h1>

        <div className="border border-gray-100 rounded-2xl overflow-hidden flex h-[70vh] shadow-sm">
          {/* Thread list */}
          <div className={`w-full md:w-72 shrink-0 border-r border-gray-100 flex flex-col ${showConversation ? "hidden md:flex" : "flex"}`}>
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="font-black text-xs text-gray-400 tracking-widest uppercase">Conversaciones</p>
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

          {/* Conversation */}
          <div className={`flex-1 flex flex-col ${showConversation ? "flex" : "hidden md:flex"}`}>
            {activeThreadId && currentUserId ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConversation(false)}
                    className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <p className="font-black text-sm text-urbik-black">{activeThread?.otherParty ?? "Conversación"}</p>
                    {activeThread?.property && (
                      <Link
                        href={`/property/${activeThread.property.id}`}
                        className="text-xs text-urbik-cyan hover:underline"
                      >
                        {activeThread.property.title}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatConversation threadId={activeThreadId} currentUserId={currentUserId} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                <MessageCircle size={40} className="text-gray-200" />
                <p className="text-sm font-bold text-gray-400">
                  {threads.length > 0 ? "Seleccioná una conversación" : "Todavía no iniciaste ninguna consulta"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
