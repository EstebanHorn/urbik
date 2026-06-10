"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ReportTargetType } from "@/lib/types";
import ReportModal from "./ReportModal";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  variant?: "icon" | "link" | "button";
  label?: string;
  contextLabel?: string;
  className?: string;
  /** Si el viewer es el dueño del contenido, no renderizar nada */
  ownerId?: string | null;
}

export default function ReportButton({
  targetType,
  targetId,
  variant = "link",
  label,
  contextLabel,
  className,
  ownerId,
}: ReportButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setViewerId(data.user?.id ?? null);
    });
  }, []);

  if (ownerId && viewerId && ownerId === viewerId) return null;

  const handleClick = () => {
    if (!viewerId) {
      const next = encodeURIComponent(pathname || "/");
      router.push(`/auth/login?next=${next}`);
      return;
    }
    setOpen(true);
  };

  const displayLabel = label ?? "Reportar";

  let trigger;
  if (variant === "icon") {
    trigger = (
      <button
        onClick={handleClick}
        aria-label={displayLabel}
        title={displayLabel}
        className={
          className ??
          "cursor-pointer p-1.5 rounded-full text-urbik-black/40 hover:bg-urbik-rose/10 hover:text-urbik-rose transition-colors"
        }
      >
        <Flag size={14} />
      </button>
    );
  } else if (variant === "button") {
    trigger = (
      <button
        onClick={handleClick}
        className={
          className ??
          "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-urbik-black/15 text-urbik-rose text-sm font-bold hover:bg-urbik-rose/5 transition-all active:scale-95"
        }
      >
        <Flag size={14} /> {displayLabel}
      </button>
    );
  } else {
    trigger = (
      <button
        onClick={handleClick}
        className={
          className ??
          "cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-urbik-black/50 hover:text-urbik-rose transition-colors"
        }
      >
        <Flag size={12} /> {displayLabel}
      </button>
    );
  }

  return (
    <>
      {trigger}
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          contextLabel={contextLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
