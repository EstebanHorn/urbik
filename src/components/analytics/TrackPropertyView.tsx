"use client";

import { useEffect } from "react";
import { getSessionId } from "@/lib/analytics/session";

export default function TrackPropertyView({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    if (!propertyId) return;
    const sessionId = getSessionId();
    if (!sessionId) return;

    fetch("/api/stats/property-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [propertyId]);

  return null;
}
