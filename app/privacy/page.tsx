import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 절약왕궁",
  description: "절약왕궁 개인정보처리방침입니다.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-[var(--text)] mb-8">개인정보처리방침</h1>
      <div className="prose prose-sm text-[var(--muted)] space-y-6 leading-relaxed text-[14px]">
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">1. 수집하는 개인정보</h2>
          <p>절약왕궁(savepalace.co.kr)은 서비스 개선을 위해 다음의 정보를 수집합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>IP 주소 (방문 통계 목적, 해시 처리)</li>
            <li>접속 기기 정보 (User-Agent)</li>
            <li>방문 페이지 및 유입 경로</li>
          </ul>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">2. 개인정보 이용 목적</h2>
          <p>수집된 정보는 서비스 개선 및 방문 통계 분석 목적으로만 사용되며, 제3자에게 제공되지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">3. 쿠키 사용</h2>
          <p>본 사이트는 다크모드 설정 저장을 위해 로컬스토리지를 사용합니다.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">4. 개인정보 보유 기간</h2>
          <p>방문 로그는 서비스 운영 목적으로 최대 1년간 보관 후 삭제됩니다.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">5. 문의</h2>
          <p>개인정보 관련 문의는 <a href="https://www.tamnacoupon.co.kr" className="text-[var(--brand-color)]">탐나는쿠폰</a>으로 연락해 주세요.</p>
        </section>
      </div>
    </div>
  );
}
