import Link from "next/link";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* 왕관 SVG */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        {/* 왕관 본체 */}
        <path
          d="M4 26 L8 12 L14 20 L18 6 L22 20 L28 12 L32 26 Z"
          fill="url(#crownGrad)"
        />
        {/* 왕관 베이스 */}
        <rect x="4" y="26" width="28" height="5" rx="2" fill="url(#crownGrad)" />
        {/* 보석 */}
        <circle cx="18" cy="7" r="3" fill="#C084FC" />
        <circle cx="8" cy="13" r="2" fill="#A855F7" />
        <circle cx="28" cy="13" r="2" fill="#A855F7" />
        {/* 하이라이트 */}
        <path d="M6 25 L8 14 L11 19" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"/>
      </svg>

      {/* 텍스트 */}
      <div className="leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className="text-[22px] font-black tracking-tight"
            style={{ color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,0.4)" }}
          >
            절약
          </span>
          <span
            className="text-[22px] font-black tracking-tight"
            style={{ color: "#C084FC", textShadow: "0 0 20px rgba(192,132,252,0.4)" }}
          >
            왕궁
          </span>
        </div>
        <div className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(180,140,255,0.5)" }}>
          SavePalace
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(7,5,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(180,140,255,0.1)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" aria-label="절약왕궁 홈">
          <Logo />
        </Link>

        <a
          href="https://www.aliexpress.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 text-[12px] font-black px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
            color: "#0A0510",
            boxShadow: "0 4px 16px rgba(255,215,0,0.25)",
          }}
        >
          🛍️ 알리익스프레스
        </a>
      </div>
    </header>
  );
}
