"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useChatThreads } from "@/hooks/useChatThreads";
import ChatThreadList from "./ChatThreadList";
import ChatConversation from "./ChatConversation";

export default function ChatPanel() {
  const { threads, loading } = useChatThreads();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const handleSelect = (id: string) => {
    setActiveThreadId(id);
    setShowConversation(true);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex h-full border border-gray-100 rounded-2xl overflow-hidden">
      {/* Thread list — hidden on mobile when conversation is open */}
      <div className={`w-full md:w-72 shrink-0 border-r border-gray-100 flex flex-col ${showConversation ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-urbik-black" />
            <h3 className="font-black text-sm text-urbik-black">Conversaciones</h3>
          </div>
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
            {/* Mobile back button + thread title */}
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
                  <p className="text-xs text-gray-400 truncate">{activeThread.property.title}</p>
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
            <p className="text-sm font-bold text-gray-400">Seleccioná una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
}
