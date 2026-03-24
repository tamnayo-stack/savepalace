"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Table, SquaresFour, Trophy, Copy, Check, Lightning, Flame } from "@phosphor-icons/react";
import CouponCard from "@/components/CouponCard";
import CopyModal from "@/components/CopyModal";
import type { Coupon } from "@/lib/coupon-types";

type CouponBoardProps = { coupons: Coupon[] };
type SortKey = "all" | "expiring" | "big";
type ViewMode = "table" | "card" | "ranking";

const RANK_LABEL = ["🥇", "🥈", "🥉", "4", "5", "6", "7", "8", "9", "10"];

function dateDiff(d: string) {
  const t = new Date(); t.setHours(0,0,0,0);
  const x = new Date(d); x.setHours(0,0,0,0);
  return Math.round((x.getTime() - t.getTime()) / 86400000);
}
function extractNum(s: string) { const m = s.match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; }

/* ── 테이블 행 ─────────────────────────────── */
const TableRow = memo(function TableRow({ c }: { c: Coupon }) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dl = dateDiff(c.expiresAt);
  const su = c.startsAt ? dateDiff(c.startsAt) : 0;
  const notStarted = c.startsAt ? su > 0 : false;
  const soon = !notStarted && dl >= 0 && dl <= 3;
  const expired = dl < 0;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(c.code); } catch {
      const el = document.createElement("textarea"); el.value = c.code;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 1800); setShowModal(true);
    if (c.url) setTimeout(() => window.open(c.url, "_blank", "noopener,noreferrer"), 2000);
    fetch("/api/coupon-clicks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c.code }) }).catch(() => {});
  };

  const expiryStr = notStarted ? `D-${su} 후` : expired ? "만료" : soon ? `D-${dl}` : `${dl}일`;

  return (
    <>
      {showModal && <CopyModal code={c.code} minPurchase={c.minPurchase} onClose={() => setShowModal(false)} />}
      <tr className={expired ? "opacity-30" : ""}>
        <td>
          <div style={{ borderLeft: "3px solid rgba(200,144,10,0.35)", paddingLeft: "12px" }}>
            <p className="font-bold text-[13px]" style={{ color: "rgba(26,16,37,0.88)" }}>{c.event || c.code}</p>
            {c.event && <p className="font-mono text-[11px] mt-0.5" style={{ color: "rgba(180,110,0,0.7)" }}>{c.code}</p>}
          </div>
        </td>
        <td className="text-center font-black text-[15px] gold-text">{c.discountAmount}</td>
        <td className="text-center text-[12px]" style={{ color: "rgba(74,58,106,0.6)" }}>{c.minPurchase || "—"}</td>
        <td className="text-center">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={soon ? { background: "rgba(220,38,38,0.08)", color: "#DC2626" }
              : expired ? { color: "#999" }
              : notStarted ? { background: "rgba(100,149,237,0.1)", color: "#5580CC" }
              : { background: "rgba(200,144,10,0.08)", color: "#C8900A" }}>
            {soon && <Lightning size={9} className="inline mr-0.5" weight="fill" />}{expiryStr}
          </span>
        </td>
        <td className="text-right pr-2">
          <button type="button" onClick={handleCopy} disabled={expired}
            className={copied ? "btn-copied" : "btn-gold"}
            style={{ padding: "7px 18px", fontSize: "12px" }}>
            {copied ? <><Check size={11} className="inline mr-1" weight="bold" />완료</> : <><Copy size={11} className="inline mr-1" weight="bold" />복사</>}
          </button>
        </td>
      </tr>
    </>
  );
});

/* ── 랭킹 행 ─────────────────────────────── */
const RankRow = memo(function RankRow({ c, rank, clicks }: { c: Coupon; rank: number; clicks: number }) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const expired = dateDiff(c.expiresAt) < 0;
  const top3 = rank <= 3;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(c.code); } catch {
      const el = document.createElement("textarea"); el.value = c.code;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 1800); setShowModal(true);
    if (c.url) setTimeout(() => window.open(c.url, "_blank", "noopener,noreferrer"), 2000);
    fetch("/api/coupon-clicks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c.code }) }).catch(() => {});
  };

  return (
    <>
      {showModal && <CopyModal code={c.code} minPurchase={c.minPurchase} onClose={() => setShowModal(false)} />}
      <div
        className={`rank-card ${top3 ? "top3" : ""} ${expired ? "opacity-30" : ""}`}
        style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}
      >
        {/* 순위 뱃지 */}
        <div className="shrink-0 w-9 text-center">
          {top3
            ? <span style={{ fontSize: "22px" }}>{RANK_LABEL[rank - 1]}</span>
            : <span className="font-black text-[15px]" style={{ color: "rgba(74,58,106,0.4)" }}>{rank}</span>
          }
        </div>

        {/* 할인 금액 */}
        <div className="shrink-0 w-20 text-right">
          <span className="gold-text font-black text-[18px]">{c.discountAmount}</span>
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13px] truncate" style={{ color: "rgba(26,16,37,0.85)" }}>
            {c.event || c.code}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(74,58,106,0.55)" }}>
            {c.minPurchase && <>{c.minPurchase} 이상 · </>}
            {clicks > 0 && <><Flame size={10} className="inline" color="#DC2626" /> {clicks}회 사용</>}
          </p>
        </div>

        {/* 복사 버튼 */}
        <button type="button" onClick={handleCopy} disabled={expired}
          className={copied ? "btn-copied" : "btn-gold"}
          style={{ padding: "8px 16px", fontSize: "12px", flexShrink: 0 }}>
          {copied ? "✓" : "복사"}
        </button>
      </div>
    </>
  );
});

/* ── 메인 CouponBoard ─────────────────────── */
export default function CouponBoard({ coupons }: CouponBoardProps) {
  const [sort, setSort] = useState<SortKey>("all");
  const [view, setView] = useState<ViewMode>("card");
  const [clickMap, setClickMap] = useState<Record<string, number>>({});

  useEffect(() => {
    void fetch("/api/coupon-clicks").then(r => r.json()).then((d: { all?: Record<string, number> }) => {
      if (d.all) setClickMap(d.all);
    }).catch(() => {});
  }, []);

  const sorted = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const valid = coupons.filter(c => { const e = new Date(c.expiresAt); e.setHours(0,0,0,0); return e >= now; });
    if (sort === "expiring") return [...valid].sort((a, b) => dateDiff(a.expiresAt) - dateDiff(b.expiresAt));
    if (sort === "big") return [...valid].sort((a, b) => extractNum(b.discountAmount) - extractNum(a.discountAmount));
    return valid;
  }, [coupons, sort]);

  const rankingList = useMemo(() =>
    [...sorted].sort((a, b) => (clickMap[b.code] ?? 0) - (clickMap[a.code] ?? 0)),
    [sorted, clickMap]
  );

  const SortBtn = useCallback(({ k, label }: { k: SortKey; label: string }) => (
    <button type="button" onClick={() => setSort(k)} className={`filter-btn ${sort === k ? "active" : ""}`}>
      {label}
    </button>
  ), [sort]);

  return (
    <div>
      {/* ── 툴바 ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <SortBtn k="all" label="전체" />
          <SortBtn k="expiring" label="마감임박" />
          <SortBtn k="big" label="할인큰순" />
        </div>

        <div className="ml-auto flex gap-1 p-1 rounded-xl" style={{ background: "rgba(200,144,10,0.05)", border: "1px solid rgba(120,80,200,0.12)" }}>
          {([["table", <Table key="t" size={15}/>], ["card", <SquaresFour key="c" size={15}/>], ["ranking", <Trophy key="r" size={15}/>]] as [ViewMode, React.ReactNode][]).map(([m, icon]) => (
            <button key={m} type="button" onClick={() => setView(m)} className={`view-btn ${view === m ? "active" : ""}`} aria-label={m}>{icon}</button>
          ))}
        </div>
      </div>

      {/* ── 카드 뷰 ── */}
      {view === "card" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(c => (
            <div key={c.notionPageId ?? c.id} className="animate-fade-up">
              <CouponCard
                event={c.event} code={c.code} minPurchase={c.minPurchase}
                discountAmount={c.discountAmount} startsAt={c.startsAt}
                expiresAt={c.expiresAt} tip={c.tip} url={c.url}
                initialClicks={clickMap[c.code]}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── 테이블 뷰 ── */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(120,80,200,0.12)" }}>
          <table className="sp-table">
            <thead>
              <tr>
                <th className="text-left pl-4">행사 / 코드</th>
                <th className="text-center">할인</th>
                <th className="text-center">최소구매</th>
                <th className="text-center">만료</th>
                <th className="text-right pr-2">복사</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => <TableRow key={c.notionPageId ?? c.id} c={c} />)}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 랭킹 뷰 ── */}
      {view === "ranking" && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} weight="fill" style={{ color: "#C8900A" }} />
            <span className="text-[13px] font-bold" style={{ color: "rgba(74,58,106,0.6)" }}>
              오늘 가장 많이 복사된 쿠폰
            </span>
          </div>
          {rankingList.map((c, i) => (
            <RankRow key={c.notionPageId ?? c.id} c={c} rank={i + 1} clicks={clickMap[c.code] ?? 0} />
          ))}
        </div>
      )}

      {/* ── 빈 상태 ── */}
      {sorted.length === 0 && (
        <div className="text-center py-24" style={{ color: "rgba(74,58,106,0.45)" }}>
          <div className="text-5xl mb-4">👑</div>
          <p className="font-bold text-[16px]">등록된 쿠폰이 없습니다</p>
          <p className="text-[13px] mt-1">곧 새로운 쿠폰이 업데이트됩니다!</p>
        </div>
      )}
    </div>
  );
}
