"use client";

import { memo, useEffect, useState } from "react";
import { Copy, Check, Lightning } from "@phosphor-icons/react";
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
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(dateStr); t.setHours(0,0,0,0);
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}

const CouponCard = memo(function CouponCard({
  event, code, minPurchase, discountAmount, startsAt, expiresAt, tip, url, initialClicks,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [todayClicks, setTodayClicks] = useState<number | null>(initialClicks ?? null);

  const daysLeft = dateDiff(expiresAt);
  const daysUntilStart = startsAt ? dateDiff(startsAt) : 0;
  const notStarted = startsAt ? daysUntilStart > 0 : false;
  const isExpiringSoon = !notStarted && daysLeft >= 0 && daysLeft <= 3;
  const isExpired = daysLeft < 0;

  useEffect(() => {
    if (initialClicks !== undefined) return;
    void fetch(`/api/coupon-clicks?code=${encodeURIComponent(code)}`)
      .then(r => r.json()).then((d: { clicks?: number }) => setTodayClicks(d.clicks ?? 0)).catch(() => setTodayClicks(0));
  }, [code, initialClicks]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch {
      const el = document.createElement("textarea"); el.value = code;
      document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    setShowModal(true);
    if (url) setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 2000);
    setTodayClicks(p => (p ?? 0) + 1);

    let visitorNumber = 0, visitCount = 0;
    try {
      const raw = sessionStorage.getItem("savePalace_visitor");
      const win = (window as unknown as Record<string, unknown>).__spVisitor as { visitorNumber?: number; visitCount?: number } | undefined;
      const src = raw ? JSON.parse(raw) as { visitorNumber?: number; visitCount?: number } : win;
      if (src) { visitorNumber = src.visitorNumber ?? 0; visitCount = src.visitCount ?? 0; }
    } catch { /* ignore */ }

    fetch("/api/coupon-clicks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, visitorNumber, visitCount }),
    }).then(r => r.json()).then((d: { clicks?: number }) => {
      if (typeof d.clicks === "number") setTodayClicks(d.clicks);
    }).catch(() => {});
  };

  const expiryText = notStarted
    ? `D-${daysUntilStart} 후 시작`
    : isExpired ? "만료"
    : isExpiringSoon ? (daysLeft === 0 ? "오늘 마감!" : `D-${daysLeft}`)
    : `${daysLeft}일 남음`;

  const cardClass = [
    "deal-card",
    isExpiringSoon ? "expiring" : "",
    notStarted ? "not-started" : "",
    isExpired ? "expired" : "",
  ].filter(Boolean).join(" ");

  /* ── 할인금액에서 숫자만 뽑아서 크게 표시 ── */
  const discountNum = discountAmount.match(/[\d,]+/)?.[0] ?? discountAmount;
  const discountUnit = discountAmount.replace(/[\d,]+/, "").trim() || "";

  return (
    <>
      {showModal && <CopyModal code={code} minPurchase={minPurchase} onClose={() => setShowModal(false)} />}

      <article className={cardClass}>
        {/* 상단 컬러바 */}
        <div className="deal-card-bar" />

        <div className="p-5 flex flex-col gap-4">
          {/* ── 상단: 이벤트명 + 뱃지 ── */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold leading-snug text-[14px]" style={{ color: "rgba(26,16,37,0.88)" }}>
              {event || "알리익스프레스 쿠폰"}
            </p>
            <span
              className="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap"
              style={
                isExpiringSoon ? { background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.22)" }
                : notStarted   ? { background: "rgba(100,149,237,0.1)", color: "#5580CC", border: "1px solid rgba(100,149,237,0.28)" }
                : isExpired    ? { background: "rgba(150,150,150,0.08)", color: "#888", border: "1px solid rgba(150,150,150,0.18)" }
                :                { background: "rgba(200,144,10,0.08)", color: "#C8900A", border: "1px solid rgba(200,144,10,0.22)" }
              }
            >
              {isExpiringSoon && <Lightning size={9} className="inline mr-0.5" weight="fill" />}
              {expiryText}
            </span>
          </div>

          {/* ── 중앙: 할인금액 HERO ── */}
          <div className="text-center py-2">
            <div className="leading-none" style={{ textShadow: "0 0 20px rgba(200,144,10,0.15)" }}>
              <span
                className="gold-shimmer-text font-black"
                style={{ fontSize: "clamp(42px, 8vw, 64px)" }}
              >
                {discountNum}
              </span>
              {discountUnit && (
                <span
                  className="font-black ml-1"
                  style={{ fontSize: "clamp(18px, 3vw, 24px)", color: "#C8900A" }}
                >
                  {discountUnit}
                </span>
              )}
            </div>
            {minPurchase && (
              <p className="text-[11px] mt-1.5 font-medium" style={{ color: "rgba(74,58,106,0.6)" }}>
                {minPurchase} 이상 구매 시
              </p>
            )}
          </div>

          {/* ── 구분선 ── */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,144,10,0.2), transparent)" }} />

          {/* ── 코드 표시 ── */}
          <div
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer"
            style={{ background: "rgba(200,144,10,0.05)", border: "1px dashed rgba(200,144,10,0.3)" }}
            onClick={isExpired ? undefined : handleCopy}
            role={isExpired ? undefined : "button"}
            tabIndex={isExpired ? undefined : 0}
          >
            <span
              className="font-mono font-black tracking-[0.15em] text-[15px]"
              style={{ color: isExpired ? "rgba(0,0,0,0.2)" : "#B8730A" }}
            >
              {code}
            </span>
          </div>

          {/* ── 사용 통계 ── */}
          {todayClicks !== null && todayClicks > 0 && (
            <p className="text-center text-[11px]" style={{ color: "rgba(74,58,106,0.55)" }}>
              🔥 오늘 {todayClicks}명이 사용했어요
            </p>
          )}

          {/* ── 복사 버튼 ── */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={isExpired}
            className={copied ? "btn-copied" : "btn-gold"}
            style={{ padding: "12px", fontSize: "14px", width: "100%" }}
          >
            {copied
              ? <><Check size={15} className="inline mr-1.5" weight="bold" />복사 완료!</>
              : <><Copy size={15} className="inline mr-1.5" weight="bold" />쿠폰 코드 복사</>
            }
          </button>

          {tip && (
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(74,58,106,0.55)", borderLeft: "2px solid rgba(200,144,10,0.25)", paddingLeft: "10px" }}>
              {tip}
            </p>
          )}
        </div>
      </article>
    </>
  );
});

export default CouponCard;
