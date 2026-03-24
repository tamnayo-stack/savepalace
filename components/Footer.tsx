export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--bg-sub)]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <p className="text-[15px] font-extrabold text-[var(--brand-color)] mb-1">절약왕궁</p>
            <p className="text-[12px] text-[var(--muted)] leading-relaxed max-w-xs">
              알리익스프레스 최신 할인코드·쿠폰코드를 매일 업데이트합니다.
              <br />도메인: www.savepalace.co.kr
            </p>
          </div>

          <div className="flex flex-col gap-1 text-[12px] text-[var(--muted)]">
            <p className="font-bold text-[var(--text)] mb-1">안내</p>
            <a href="/privacy" className="hover:text-[var(--brand-color)] transition-colors">
              개인정보처리방침
            </a>
            <a href="/terms" className="hover:text-[var(--brand-color)] transition-colors">
              이용약관
            </a>
            <a
              href="https://www.tamnacoupon.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--brand-color)] transition-colors"
            >
              탐나는쿠폰 (파트너 사이트)
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--line)]">
          <p className="text-[11px] text-[var(--muted)] leading-relaxed">
            © {year} 절약왕궁 (SavePalace). 본 사이트는 알리익스프레스 제휴 파트너입니다.
            쿠폰 사용 시 조건 및 만료일을 반드시 확인하세요.
            표시된 할인 정보는 실시간으로 변경될 수 있습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
