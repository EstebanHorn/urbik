"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  propertyId: number;
  realEstateId: string;
}

export default function StartChatButton({ propertyId, realEstateId }: Props) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setIsAuth(!!data.session));
  }, []);

  const handleClick = async () => {
    if (!isAuth) {
      router.push(`/auth/login?redirect=/property/${propertyId}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, realEstateId }),
      });
      if (res.ok) {
        const { threadId } = await res.json();
        router.push(`/messages?thread=${threadId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuth === null) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-urbik-black text-white font-black py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer text-sm tracking-wide"
    >
      <MessageCircle size={18} />
      {loading ? "Abriendo chat..." : isAuth ? "Consultar por chat" : "Iniciar sesión para consultar"}
    </button>
  );
}
