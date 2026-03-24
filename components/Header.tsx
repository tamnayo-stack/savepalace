import ThemeToggle from "@/components/ThemeToggle";

function CrownLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="절약왕궁 로고"
    >
      {/* Crown shape */}
      <g>
        {/* Crown base bar */}
        <rect x="4" y="34" width="44" height="7" rx="2" fill="var(--gold)" />
        {/* Crown left point */}
        <polygon points="6,34 14,14 22,26 26,34" fill="var(--gold)" />
        {/* Crown center point (tallest) */}
        <polygon points="18,34 26,8 34,34" fill="var(--gold)" />
        {/* Crown right point */}
        <polygon points="26,34 30,26 38,14 46,34" fill="var(--gold)" />
        {/* Jewels */}
        <circle cx="26" cy="9" r="3.5" fill="var(--brand-color)" />
        <circle cx="14" cy="15" r="2.5" fill="var(--brand-color)" />
        <circle cx="38" cy="15" r="2.5" fill="var(--brand-color)" />
        {/* Shine on base */}
        <rect x="8" y="35.5" width="36" height="2" rx="1" fill="var(--gold-dark)" opacity="0.3" />
      </g>

      {/* Site name */}
      <text
        x="60"
        y="32"
        fontSize="23"
        fontWeight="800"
        fontFamily="'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"
        letterSpacing="-0.5"
      >
        <tspan fill="var(--gold)">절약</tspan>
        <tspan fill="var(--brand-color)">왕궁</tspan>
      </text>

      {/* Tagline */}
      <text
        x="61"
        y="46"
        fontSize="9"
        fontWeight="500"
        fontFamily="'Noto Sans KR', sans-serif"
        fill="var(--muted)"
        letterSpacing="0.5"
      >
        SAVE PALACE · 알리익스프레스 최저가 쿠폰
      </text>
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" aria-label="절약왕궁 홈으로" className="flex items-center">
          <CrownLogo className="h-11 w-auto" />
        </a>

        <div className="flex items-center gap-2">
          <a
            href="https://www.aliexpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--brand-color-soft)] text-[var(--brand-color)] hover:bg-[var(--brand-color)] hover:text-white transition-colors"
          >
            <span>🛍️</span>
            <span>알리익스프레스 바로가기</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
