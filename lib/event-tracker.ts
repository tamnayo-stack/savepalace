type EventType =
  | "coupon_copy"
  | "coupon_click"
  | "search";

interface TrackOptions {
  type: EventType;
  label?: string;
  delay?: number;
}

export function trackEvent(opts: TrackOptions): void {
  if (typeof window === "undefined") return;

  const page = window.location.pathname;

  let visitorNumber = 0;
  let visitCount = 0;
  try {
    const raw = sessionStorage.getItem("savePalace_visitor");
    const win = (window as unknown as Record<string, unknown>).__spVisitor as
      | { visitorNumber?: number; visitCount?: number }
      | undefined;
    const src = raw ? (JSON.parse(raw) as { visitorNumber?: number; visitCount?: number }) : win;
    if (src) {
      visitorNumber = src.visitorNumber ?? 0;
      visitCount = src.visitCount ?? 0;
    }
  } catch { /* ignore */ }

  const send = () => {
    void fetch("/api/event-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...opts, page, visitorNumber, visitCount }),
    }).catch(() => {});
  };

  if (opts.delay && opts.delay > 0) setTimeout(send, opts.delay);
  else send();
}
