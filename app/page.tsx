import type { Metadata } from "next";
import { Crown } from "@phosphor-icons/react/dist/ssr";
import CouponBoard from "@/components/CouponBoard";
import { getAliCoupons } from "@/lib/notion-coupon-store";

export const metadata: Metadata = {
  title: "알리익스프레스 쿠폰·할인코드 최신 2026 | 절약왕궁",
  description:
    "알리익스프레스 2026년 최신 쿠폰코드와 할인코드를 절약왕궁에서 무료로 확인하세요. CHOICE DAY, 어서오세일, 신규가입 프로모션까지 매일 업데이트됩니다.",
  alternates: { canonical: "https://www.savepalace.co.kr" },
};

const itemListJsonLd = (coupons: { code: string; event: string; discountAmount: string; expiresAt: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "알리익스프레스 최신 쿠폰·할인코드 목록",
  description: "절약왕궁에서 제공하는 알리익스프레스 최신 쿠폰 목록",
  numberOfItems: coupons.length,
  itemListElement: coupons.slice(0, 10).map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.event || c.code,
    description: `${c.discountAmount} 할인 쿠폰 (만료: ${c.expiresAt})`,
  })),
});

export default async function HomePage() {
  const coupons = await getAliCoupons();
  const validCount = coupons.filter((c) => {
    const d = new Date(c.expiresAt);
    return d >= new Date(new Date().toDateString());
  }).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(coupons)) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── 히어로 섹션 ── */}
        <section className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[var(--gold-soft)] text-[var(--gold)] text-[12px] font-bold px-3 py-1.5 rounded-full mb-4 border border-[var(--gold)]/30">
            <Crown size={13} weight="fill" />
            알리익스프레스 전용 쿠폰 허브
          </div>

          <h1 className="text-[28px] sm:text-[36px] font-black text-[var(--text)] leading-tight mb-3">
            알리익스프레스 최신{" "}
            <span style={{ color: "var(--brand-color)" }}>쿠폰·할인코드</span>{" "}
            모음
          </h1>

          <p className="text-[14px] sm:text-[16px] text-[var(--muted)] leading-relaxed max-w-2xl">
            절약왕궁에서{" "}
            <strong className="text-[var(--text)]">매일 업데이트</strong>되는 알리익스프레스 프로모션 코드를 확인하세요.
            코드를 클릭하면 바로 복사됩니다.
          </p>

          {/* 통계 배지 */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--line)] rounded-full px-3 py-1.5 text-[12px] font-bold text-[var(--text)] shadow-sm">
              <span style={{ color: "var(--brand-color)" }}>🎟</span>
              <span>유효 쿠폰 <strong style={{ color: "var(--brand-color)" }}>{validCount}개</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--line)] rounded-full px-3 py-1.5 text-[12px] font-bold text-[var(--text)] shadow-sm">
              <span>🔄</span>
              <span>매일 업데이트</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--line)] rounded-full px-3 py-1.5 text-[12px] font-bold text-[var(--text)] shadow-sm">
              <span>✅</span>
              <span>무료 제공</span>
            </div>
          </div>
        </section>

        {/* ── 쿠폰 보드 ── */}
        <section>
          <CouponBoard coupons={coupons} />
        </section>

        {/* ── 사용 방법 안내 ── */}
        <section className="mt-12 p-6 rounded-2xl bg-[var(--bg-sub)] border border-[var(--line)]">
          <h2 className="text-[17px] font-extrabold text-[var(--text)] mb-4 flex items-center gap-2">
            <Crown size={18} weight="fill" color="var(--gold)" />
            알리익스프레스 쿠폰 사용 방법
          </h2>
          <ol className="flex flex-col gap-3 text-[14px] text-[var(--muted)] leading-relaxed">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center"
                style={{ background: "var(--brand-color)" }}>1</span>
              <span><strong className="text-[var(--text)]">원하는 쿠폰의 코드를 복사</strong>하세요. 복사 버튼을 누르면 자동으로 알리익스프레스로 이동합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center"
                style={{ background: "var(--brand-color)" }}>2</span>
              <span>알리익스프레스 <strong className="text-[var(--text)]">장바구니</strong>에 쿠폰 조건 이상의 상품을 담으세요.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center"
                style={{ background: "var(--brand-color)" }}>3</span>
              <span>결제 화면에서 <strong className="text-[var(--text)]">&ldquo;할인코드&rdquo;</strong> 항목에 복사한 코드를 붙여넣고 적용하기를 눌러 할인을 받으세요!</span>
            </li>
          </ol>
        </section>
      </div>
    </>
  );
}
