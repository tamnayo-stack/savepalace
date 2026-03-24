"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") ?? "";
    const utmMedium = params.get("utm_medium") ?? "";
    const utmCampaign = params.get("utm_campaign") ?? "";

    void fetch("/api/visitor-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname,
        referrer: document.referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      }),
    })
      .then((r) => r.json())
      .then((d: { ok?: boolean; visitorNumber?: number; visitCount?: number }) => {
        if (d.ok && d.visitorNumber) {
          const info = { visitorNumber: d.visitorNumber, visitCount: d.visitCount ?? 1 };
          try {
            sessionStorage.setItem("savePalace_visitor", JSON.stringify(info));
            (window as unknown as Record<string, unknown>).__spVisitor = info;
          } catch { /* ignore */ }
        }
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
