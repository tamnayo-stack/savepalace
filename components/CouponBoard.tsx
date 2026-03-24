"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Table, SquaresFour, Trophy, Copy, Check, Fire } from "@phosphor-icons/react";
import CouponCard from "@/components/CouponCard";
import CopyModal from "@/components/CopyModal";
import type { Coupon } from "@/lib/coupon-types";

type CouponBoardProps = { coupons: Coupon[] };
type SortKey = "all" | "expiring" | "big";
type ViewMode = "table" | "card" | "ranking";

const RANK_BADGE = ["🥇", "🥈", "🥉", "4위", "5위", "6위", "7위", "8위", "9위", "10위"];

function dateDiff(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function extractDiscountNumber(discountAmount: string): number {
  const m = discountAmount.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

/* ── 테이블 행 ── */
const TableRow = memo(function TableRow({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [todayClicks, setTodayClicks] = useState<number | null>(null);

  const daysLeft = dateDiff(coupon.expiresAt);
  const daysUntilStart = coupon.startsAt ? dateDiff(coupon.startsAt) : 0;
  const notStarted = coupon.startsAt ? daysUntilStart > 0 : false;
  const isExpiringSoon = !notStarted && daysLeft >= 0 && daysLeft <= 3;
  const isExpired = daysLeft < 0;

  useEffect(() => {
    void fetch(`/api/coupon-clicks?code=${encodeURIComponent(coupon.code)}`)
      .then((r) => r.json())
      .then((d: { clicks?: number }) => setTodayClicks(d.clicks ?? 0))
      .catch(() => setTodayClicks(0));
  }, [coupon.code]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(coupon.code); }
    catch {
      const el = document.createElement("textarea");
      el.value = coupon.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    setShowModal(true);
    if (coupon.url) setTimeout(() => window.open(coupon.url, "_blank", "noopener,noreferrer"), 2000);

    let visitorNumber = 0, visitCount = 0;
    try {
      const raw = sessionStorage.getItem("savePalace_visitor");
      const win = (window as unknown as Record<string, unknown>).__spVisitor as { visitorNumber?: number; visitCount?: number } | undefined;
      const src = raw ? JSON.parse(raw) as { visitorNumber?: number; visitCount?: number } : win;
      if (src) { visitorNumber = src.visitorNumber ?? 0; visitCount = src.visitCount ?? 0; }
    } catch { /* ignore */ }

    fetch("/api/coupon-clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.code, visitorNumber, visitCount }),
    }).catch(() => {});
  };

  const expiryText = notStarted
    ? `D-${daysUntilStart} 후 시작`
    : isExpired ? "만료됨"
    : isExpiringSoon ? (daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`)
    : `~${coupon.expiresAt.slice(5)}`;

  return (
    <>
      {showModal && <CopyModal code={coupon.code} minPurchase={coupon.minPurchase} onClose={() => setShowModal(false)} />}
      <tr className={isExpired ? "opacity-40" : ""}>
        <td>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[var(--text)]">{coupon.event || coupon.code}</span>
            {coupon.event && <span className="text-[11px] text-[var(--muted)] font-mono">{coupon.code}</span>}
          </div>
        </td>
        <td className="text-center">
          <span className="font-extrabold text-[var(--brand-color)]">{coupon.discountAmount}</span>
        </td>
        <td className="text-center text-[var(--muted)]">{coupon.minPurchase || "-"}</td>
        <td className="text-center">
          <span className={[
            "text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
            isExpiringSoon ? "bg-[var(--gold-soft)] text-[var(--gold)]" :
            isExpired ? "bg-red-50 text-red-400" :
            notStarted ? "bg-blue-50 text-blue-600" :
            "bg-[var(--bg-sub)] text-[var(--muted)]",
          ].join(" ")}>
            {isExpiringSoon && <Fire size={10} className="inline mr-0.5" weight="fill" />}
            {expiryText}
          </span>
        </td>
        <td className="text-center">
          {todayClicks !== null && todayClicks > 0 && (
            <span className="text-[12px] text-[var(--muted)]">🔥 {todayClicks}회</span>
          )}
        </td>
        <td className="text-right">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isExpired}
            className={[
              "h-9 px-4 rounded-xl text-[12px] font-extrabold text-white transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              copied ? "bg-emerald-500" : "hover:-translate-y-0.5",
            ].join(" ")}
            style={!copied ? {
              background: "linear-gradient(135deg, var(--brand-color), var(--brand-color-dark))",
              boxShadow: "0 2px 8px var(--brand-color-glow)",
            } : undefined}
          >
            {copied ? <><Check size={12} className="inline mr-1" />완료</> : <><Copy size={12} className="inline mr-1" />복사</>}
          </button>
        </td>
      </tr>
    </>
  );
});

/* ── 랭킹 행 ── */
const RankRow = memo(function RankRow({ coupon, rank }: { coupon: Coupon; rank: number }) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [todayClicks, setTodayClicks] = useState<number | null>(null);

  useEffect(() => {
    void fetch(`/api/coupon-clicks?code=${encodeURIComponent(coupon.code)}`)
      .then((r) => r.json())
      .then((d: { clicks?: number }) => setTodayClicks(d.clicks ?? 0))
      .catch(() => setTodayClicks(0));
  }, [coupon.code]);

  const isExpired = dateDiff(coupon.expiresAt) < 0;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(coupon.code); }
    catch {
      const el = document.createElement("textarea");
      el.value = coupon.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    setShowModal(true);
    if (coupon.url) setTimeout(() => window.open(coupon.url, "_blank", "noopener,noreferrer"), 2000);

    let visitorNumber = 0, visitCount = 0;
    try {
      const raw = sessionStorage.getItem("savePalace_visitor");
      const win = (window as unknown as Record<string, unknown>).__spVisitor as { visitorNumber?: number; visitCount?: number } | undefined;
      const src = raw ? JSON.parse(raw) as { visitorNumber?: number; visitCount?: number } : win;
      if (src) { visitorNumber = src.visitorNumber ?? 0; visitCount = src.visitCount ?? 0; }
    } catch { /* ignore */ }

    fetch("/api/coupon-clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.code, visitorNumber, visitCount }),
    }).catch(() => {});
  };

  const isTop3 = rank <= 3;

  return (
    <>
      {showModal && <CopyModal code={coupon.code} minPurchase={coupon.minPurchase} onClose={() => setShowModal(false)} />}
      <div
        className={[
          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-[0_6px_24px_var(--brand-color-glow)]",
          isTop3
            ? "border-[var(--gold)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--gold-soft)]"
            : "border-[var(--line)] bg-[var(--bg-card)]",
          isExpired ? "opacity-40" : "",
        ].join(" ")}
      >
        {/* 순위 */}
        <div className="w-10 shrink-0 text-center">
          <span className={isTop3 ? "text-xl" : "text-sm font-black text-[var(--muted)]"}>
            {RANK_BADGE[rank - 1]}
          </span>
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--text)] text-[14px] leading-snug truncate">{coupon.event || coupon.code}</p>
          <p className="text-[12px] text-[var(--muted)] mt-0.5">
            <span className="font-extrabold text-[var(--brand-color)]">{coupon.discountAmount}</span>
            {coupon.minPurchase && <> · {coupon.minPurchase} 이상</>}
            {todayClicks !== null && todayClicks > 0 && (
              <span className="ml-2 text-[var(--gold)] font-bold">🔥 {todayClicks}회 사용</span>
            )}
          </p>
        </div>

        {/* 복사 버튼 */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={isExpired}
          className={[
            "shrink-0 h-9 px-4 rounded-xl text-[12px] font-extrabold text-white transition-all",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            copied ? "bg-emerald-500" : "hover:-translate-y-0.5",
          ].join(" ")}
          style={!copied ? {
            background: "linear-gradient(135deg, var(--brand-color), var(--brand-color-dark))",
            boxShadow: "0 2px 8px var(--brand-color-glow)",
          } : undefined}
        >
          {copied ? "✓ 복사됨" : "복사"}
        </button>
      </div>
    </>
  );
});

/* ── 메인 CouponBoard ── */
export default function CouponBoard({ coupons }: CouponBoardProps) {
  const [sort, setSort] = useState<SortKey>("all");
  const [view, setView] = useState<ViewMode>("card");
  const [clickMap, setClickMap] = useState<Record<string, number>>({});

  useEffect(() => {
    void fetch("/api/coupon-clicks")
      .then((r) => r.json())
      .then((d: { all?: Record<string, number> }) => {
        if (d.all) setClickMap(d.all);
      })
      .catch(() => {});
  }, []);

  const sorted = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const valid = coupons.filter((c) => {
      const exp = new Date(c.expiresAt);
      exp.setHours(0, 0, 0, 0);
      return exp >= now;
    });
    if (sort === "expiring") {
      return [...valid].sort((a, b) => dateDiff(a.expiresAt) - dateDiff(b.expiresAt));
    }
    if (sort === "big") {
      return [...valid].sort(
        (a, b) => extractDiscountNumber(b.discountAmount) - extractDiscountNumber(a.discountAmount),
      );
    }
    return valid;
  }, [coupons, sort]);

  const rankingList = useMemo(() => {
    return [...sorted].sort(
      (a, b) => (clickMap[b.code] ?? 0) - (clickMap[a.code] ?? 0),
    );
  }, [sorted, clickMap]);

  const displayList = view === "ranking" ? rankingList : sorted;

  const SortBtn = useCallback(({ k, label }: { k: SortKey; label: string }) => (
    <button
      type="button"
      onClick={() => setSort(k)}
      className={[
        "text-[12px] font-bold px-3 py-1.5 rounded-full transition-all",
        sort === k
          ? "bg-[var(--brand-color)] text-white shadow-[0_2px_8px_var(--brand-color-glow)]"
          : "bg-[var(--bg-sub)] text-[var(--muted)] hover:text-[var(--brand-color)]",
      ].join(" ")}
    >
      {label}
    </button>
  ), [sort]);

  return (
    <div>
      {/* ── 툴바 ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* 정렬 */}
        <div className="flex gap-1.5">
          <SortBtn k="all" label="전체" />
          <SortBtn k="expiring" label="마감임박" />
          <SortBtn k="big" label="할인큰순" />
        </div>

        {/* 뷰 모드 */}
        <div className="ml-auto flex gap-1 bg-[var(--bg-sub)] p-1 rounded-xl">
          {([
            ["table", <Table key="t" size={15} />],
            ["card", <SquaresFour key="c" size={15} />],
            ["ranking", <Trophy key="r" size={15} />],
          ] as [ViewMode, React.ReactNode][]).map(([mode, icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              aria-label={mode}
              className={[
                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                view === mode
                  ? "bg-[var(--brand-color)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--brand-color)]",
              ].join(" ")}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── 뷰: 카드 ── */}
      {view === "card" && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
          {displayList.map((coupon) => (
            <CouponCard
              key={coupon.notionPageId ?? coupon.id}
              event={coupon.event}
              code={coupon.code}
              minPurchase={coupon.minPurchase}
              discountAmount={coupon.discountAmount}
              startsAt={coupon.startsAt}
              expiresAt={coupon.expiresAt}
              tip={coupon.tip}
              url={coupon.url}
              initialClicks={clickMap[coupon.code]}
            />
          ))}
        </div>
      )}

      {/* ── 뷰: 테이블 ── */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
          <table className="sp-table w-full">
            <thead>
              <tr>
                <th className="text-left min-w-[180px]">행사/코드</th>
                <th className="text-center">할인</th>
                <th className="text-center">최소구매</th>
                <th className="text-center">만료일</th>
                <th className="text-center">사용 현황</th>
                <th className="text-right pr-4">복사</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((coupon) => (
                <TableRow key={coupon.notionPageId ?? coupon.id} coupon={coupon} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 뷰: 랭킹 ── */}
      {view === "ranking" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} weight="fill" color="var(--gold)" />
            <span className="text-[13px] font-bold text-[var(--muted)]">
              오늘 가장 많이 사용된 쿠폰 순위
            </span>
          </div>
          {rankingList.map((coupon, i) => (
            <RankRow
              key={coupon.notionPageId ?? coupon.id}
              coupon={coupon}
              rank={i + 1}
            />
          ))}
        </div>
      )}

      {displayList.length === 0 && (
        <div className="text-center py-20 text-[var(--muted)]">
          <div className="text-5xl mb-4">👑</div>
          <p className="font-bold text-[16px]">현재 등록된 쿠폰이 없습니다</p>
          <p className="text-[13px] mt-1">곧 새로운 쿠폰이 업데이트됩니다!</p>
        </div>
      )}
    </div>
  );
}
