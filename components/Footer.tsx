export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-20"
      style={{ borderTop: "1px solid rgba(120,80,200,0.1)" }}
    >
      <div
        className="max-w-5xl mx-auto px-4 py-10"
        style={{ color: "rgba(74,58,106,0.6)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
          {/* 브랜드 */}
          <div>
            <p className="text-[16px] font-black mb-2" style={{ color: "#C8900A" }}>
              절약왕궁 <span style={{ color: "rgba(74,58,106,0.45)", fontSize: "12px", fontWeight: 500 }}>SavePalace</span>
            </p>
            <p className="text-[12px] leading-relaxed max-w-xs">
              알리익스프레스 최신 쿠폰·할인코드 전문<br />
              www.savepalace.co.kr
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-8 text-[12px]">
            <div className="flex flex-col gap-2">
              <p className="font-bold mb-1" style={{ color: "rgba(74,58,106,0.8)" }}>사이트</p>
              <a href="/privacy" className="hover:text-yellow-700 transition-colors">개인정보처리방침</a>
              <a href="/terms" className="hover:text-yellow-700 transition-colors">이용약관</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold mb-1" style={{ color: "rgba(74,58,106,0.8)" }}>파트너</p>
              <a
                href="https://www.tamnacoupon.co.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-700 transition-colors"
              >
                탐나는쿠폰
              </a>
              <a
                href="https://www.aliexpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-700 transition-colors"
              >
                AliExpress
              </a>
            </div>
          </div>
        </div>

        <div
          className="pt-6 text-[11px] leading-relaxed"
          style={{ borderTop: "1px solid rgba(120,80,200,0.08)" }}
        >
          © {year} 절약왕궁(SavePalace). 알리익스프레스 제휴 파트너.
          표시된 쿠폰 정보는 예고 없이 변경될 수 있습니다.
        </div>
      </div>
    </footer>
  );
}
