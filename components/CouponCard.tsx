"use client";

import { memo, useEffect, useState } from "react";
import { Copy, Check, Crown, Fire } from "@phosphor-icons/react";
import CopyModal from "@/components/CopyModal";

export type CouponCardProps = {
  event: string;
  code: string;
  minPurchase: string;
  discountAmount: string;
  startsAt?: string;
  expiresAt: string;
  tip: string;
  url?: string;
  initialClicks?: number;
};

function dateDiff(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const STUB_W = 200;
const NOTCH_R = 12;

const Notch = ({ pos }: { pos: "top" | "bottom" }) => (
  <span
    aria-hidden="true"
    className="absolute z-20 rounded-full border border-[var(--line)]"
    style={{
      width: NOTCH_R * 2,
      height: NOTCH_R * 2,
      left: STUB_W - NOTCH_R,
      [pos]: -NOTCH_R,
      background: "var(--bg)",
    }}
  />
);

const CouponCard = memo(function CouponCard({
  event,
  code,
  minPurchase,
  discountAmount,
  startsAt,
  expiresAt,
  tip,
  url,
  initialClicks,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [todayClicks, setTodayClicks] = useState<number | null>(initialClicks ?? null);
  const [hovering, setHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const daysLeft = dateDiff(expiresAt);
  const daysUntilStart = startsAt ? dateDiff(startsAt) : 0;
  const notStarted = startsAt ? daysUntilStart > 0 : false;
  const isExpiringSoon = !notStarted && daysLeft >= 0 && daysLeft <= 3;
  const isExpired = daysLeft < 0;

  useEffect(() => {
    if (initialClicks !== undefined) return;
    void fetch(`/api/coupon-clicks?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d: { clicks?: number }) => setTodayClicks(d.clicks ?? 0))
      .catch(() => setTodayClicks(0));
  }, [code, initialClicks]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    setShowModal(true);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);

    if (url) {
      setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 2000);
    }

    setTodayClicks((prev) => (prev ?? 0) + 1);

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

    fetch("/api/coupon-clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, visitorNumber, visitCount }),
    })
      .then((r) => r.json())
      .then((d: { clicks?: number }) => {
        if (typeof d.clicks === "number") setTodayClicks(d.clicks);
      })
      .catch(() => {});
  };

  const expiryText = notStarted
    ? `D-${daysUntilStart} 후 시작`
    : isExpired
    ? "만료됨"
    : isExpiringSoon
    ? (daysLeft === 0 ? "오늘 마감!" : `D-${daysLeft} 마감`)
    : `~ ${expiresAt.slice(5)} (${daysLeft}일 남음)`;

  return (
    <>
      {showModal && (
        <CopyModal code={code} minPurchase={minPurchase} onClose={() => setShowModal(false)} />
      )}

      <article
        className={[
          "coupon-ticket-card relative overflow-hidden",
          "rounded-2xl border bg-[var(--bg-card)]",
          "shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_var(--brand-color-glow)]",
          isExpiringSoon ? "border-[var(--gold)]" : "border-[var(--line)]",
          isExpired ? "opacity-50" : "",
        ].filter(Boolean).join(" ")}
        style={{ display: "grid", gridTemplateColumns: `${STUB_W}px 1fr` }}
      >
        {/* ══ 좌측 스텁 (Royal Purple gradient) ══ */}
        <div
          className="relative flex flex-col items-center justify-center gap-2.5 px-4 py-5 text-center"
          style={{
            background: isExpiringSoon
              ? "linear-gradient(160deg, #1c1400 0%, #3d2a08 100%)"
              : "linear-gradient(160deg, #2D1B69 0%, #4C1D95 50%, #3B0764 100%)",
          }}
        >
          {/* Crown 아이콘 */}
          <Crown size={16} color="var(--gold)" weight="fill" className="opacity-70" />

          {/* 할인 금액 */}
          <strong
            className="block text-white font-black leading-none tracking-tight"
            style={{ fontSize: "clamp(28px, 3.5vw, 46px)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            {discountAmount}
          </strong>

          {/* 구분선 */}
          <div className="w-8 h-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.35)" }} />

          {/* 최소 구매 조건 */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,215,0,0.55)" }}>
              최소 구매
            </span>
            <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
              {minPurchase || "조건 없음"}
            </span>
          </div>

          {/* 세로 점선 */}
          <div className="absolute right-0 top-5 bottom-5 w-0 border-r-2 border-dashed" style={{ borderColor: "rgba(255,215,0,0.2)" }} />
        </div>

        {/* 노치 */}
        <Notch pos="top" />
        <Notch pos="bottom" />

        {/* ══ 우측 바디 ══ */}
        <div className="flex flex-col justify-between gap-2.5 px-4 py-3.5">

          {/* 이벤트명 + 만료 뱃지 */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-[16px] font-bold text-[var(--text)] leading-snug flex-1 min-w-0">
              {event}
            </p>
            <span className={[
              "shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap",
              notStarted     ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" :
              isExpired      ? "bg-red-50 text-red-400" :
              isExpiringSoon ? "bg-[var(--gold-soft)] text-[var(--gold)] animate-pulse" :
              "bg-[var(--bg-sub)] text-[var(--muted)]",
            ].join(" ")}>
              {isExpiringSoon && <Fire size={11} weight="fill" className="inline mr-0.5" />}
              {expiryText}
            </span>
          </div>

          {/* 코드 + 복사 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isExpired}
              aria-label={`쿠폰 코드 ${code} 복사`}
              className={[
                "h-11 px-3 rounded-xl flex-1 min-w-0",
                "border-2 border-dashed font-mono font-black text-[15px] tracking-widest truncate",
                "transition-all duration-150",
                isExpired
                  ? "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] cursor-not-allowed"
                  : "border-[var(--line)] bg-[var(--bg)] text-[var(--text)] cursor-pointer hover:border-[var(--brand-color)] hover:bg-[var(--brand-color-soft)] hover:text-[var(--brand-color)]",
              ].join(" ")}
            >
              {code}
            </button>

            <div className="relative shrink-0">
              {(hovering || showTooltip) && todayClicks !== null && todayClicks > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-lg pointer-events-none"
                  style={{ background: "var(--brand-color-dark)" }}>
                  🔥 금일 {todayClicks}명 사용
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                    style={{ borderTopColor: "var(--brand-color-dark)" }} />
                </div>
              )}
              <button
                type="button"
                onClick={handleCopy}
                disabled={isExpired}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                aria-label="쿠폰 코드 복사하기"
                className={[
                  "h-11 px-5 rounded-xl text-[13px] font-extrabold text-white whitespace-nowrap",
                  "transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                  copied ? "bg-emerald-500 shadow-md" : "hover:-translate-y-0.5 active:translate-y-0",
                ].join(" ")}
                style={!copied ? {
                  background: "linear-gradient(135deg, var(--brand-color), var(--brand-color-dark))",
                  boxShadow: "0 4px 14px var(--brand-color-glow)",
                } : undefined}
              >
                {copied ? <><Check size={14} className="inline mr-1" />복사됨</> : <><Copy size={14} className="inline mr-1" />복사</>}
              </button>
            </div>
          </div>

          {tip && (
            <p className="text-[11px] text-[var(--muted)] leading-relaxed border-l-2 border-[var(--gold)] pl-2.5 -mt-0.5">
              {tip}
            </p>
          )}
        </div>
      </article>
    </>
  );
});

export default CouponCard;
