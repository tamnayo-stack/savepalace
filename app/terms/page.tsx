import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 절약왕궁",
  description: "절약왕궁 이용약관입니다.",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-[var(--text)] mb-8">이용약관</h1>
      <div className="space-y-6 text-[14px] text-[var(--muted)] leading-relaxed">
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">제1조 (목적)</h2>
          <p>본 약관은 절약왕궁(www.savepalace.co.kr, 이하 &lsquo;사이트&rsquo;)이 제공하는 쿠폰 정보 서비스의 이용 조건을 규정합니다.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">제2조 (서비스 내용)</h2>
          <p>사이트는 알리익스프레스의 최신 쿠폰코드 및 할인코드 정보를 제공합니다. 쿠폰의 유효성 및 조건은 변경될 수 있으며, 사이트는 이에 대한 책임을 지지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">제3조 (면책사항)</h2>
          <p>제공되는 쿠폰 정보는 각 브랜드의 정책에 따라 예고 없이 변경 또는 종료될 수 있습니다. 사이트는 쿠폰 미적용으로 인한 손해에 대해 책임지지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">제4조 (제휴 관계)</h2>
          <p>본 사이트는 알리익스프레스 어필리에이트 파트너로, 쿠폰 링크를 통한 구매 시 수수료를 받을 수 있습니다. 이는 이용자에게 추가 비용을 발생시키지 않습니다.</p>
        </section>
      </div>
    </div>
  );
}
