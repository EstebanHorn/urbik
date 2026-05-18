"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ slug, className }: { slug: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className={className ?? "flex items-center justify-center gap-2 rounded-full px-5 py-2 text-md font-bold border border-urbik-cyan text-urbik-cyan hover:bg-urbik-cyan hover:text-urbik-black cursor-pointer transition-colors"}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? "¡Copiado!" : "Compartir"}
    </button>
  );
}
