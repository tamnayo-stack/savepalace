import Link from "next/link";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* 왕관 SVG */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8900A" />
            <stop offset="50%" stopColor="#E07800" />
            <stop offset="100%" stopColor="#C8900A" />
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
        <circle cx="18" cy="7" r="3" fill="#7C3AED" />
        <circle cx="8" cy="13" r="2" fill="#6D28D9" />
        <circle cx="28" cy="13" r="2" fill="#6D28D9" />
        {/* 하이라이트 */}
        <path d="M6 25 L8 14 L11 19" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none"/>
      </svg>

      {/* 텍스트 */}
      <div className="leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className="text-[22px] font-black tracking-tight"
            style={{ color: "#C8900A", textShadow: "0 1px 6px rgba(200,144,10,0.2)" }}
          >
            절약
          </span>
          <span
            className="text-[22px] font-black tracking-tight"
            style={{ color: "#7C3AED", textShadow: "0 1px 6px rgba(124,58,237,0.2)" }}
          >
            왕궁
          </span>
        </div>
        <div className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(100,60,200,0.45)" }}>
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
        background: "rgba(245,242,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(120,80,200,0.12)",
        boxShadow: "0 1px 12px rgba(120,80,200,0.07)",
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
            background: "linear-gradient(135deg, #E09800 0%, #C87000 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 14px rgba(200,144,10,0.28)",
          }}
        >
          알리익스프레스
        </a>
      </div>
    </header>
  );
}
