"use client";

import { useEffect } from "react";
import { getSessionId } from "@/lib/analytics/session";

export default function TrackAgencyView({ realEstateId }: { realEstateId: string }) {
  useEffect(() => {
    if (!realEstateId) return;
    const sessionId = getSessionId();
    if (!sessionId) return;

    fetch("/api/stats/agency-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ realEstateId, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [realEstateId]);

  return null;
}
