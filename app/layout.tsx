import type { Metadata } from "next";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = "https://www.savepalace.co.kr";
const siteName = "절약왕궁";
const siteDescription =
  "알리익스프레스 최신 쿠폰코드·할인코드를 한눈에 확인하고 즉시 복사하세요. 매일 업데이트되는 알리 프로모션 코드로 최대 할인을 받아보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `알리익스프레스 쿠폰·할인코드 2026 최신 | ${siteName}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "알리익스프레스 쿠폰",
    "알리익스프레스 할인코드",
    "알리 프로모션 코드",
    "알리 쿠폰코드",
    "aliexpress 쿠폰 2026",
    "알리익스프레스 쿠폰 2026",
    "알리익스프레스 CHOICE DAY 쿠폰",
    "알리익스프레스 첫구매 쿠폰",
    "알리익스프레스 신규가입 쿠폰",
    "알리 무료배송 코드",
    "aliexpress promo code korea",
    "알리익스프레스 어서오세일",
    "알리 쿠폰 적용방법",
    "알리 슈퍼딜 쿠폰",
    "알리 쿠폰 안될때",
    "알리익스프레스 애니버서리",
    "알리 선착순 쿠폰",
    "aliexpress coupon code 2026",
    "알리익스프레스 할인받는법",
    "절약왕궁",
    "savepalace",
    "해외직구 쿠폰",
    "알리 쿠폰 모음",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName,
    title: `알리익스프레스 쿠폰·할인코드 2026 최신 | ${siteName}`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} - 알리익스프레스 최신 쿠폰·할인코드 모음`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `알리익스프레스 쿠폰·할인코드 2026 | ${siteName}`,
    description: siteDescription,
    images: [`${siteUrl}/opengraph-image.png`],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "ko-KR": siteUrl,
    },
  },
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
    "naver-site-verification": process.env.NAVER_SITE_VERIFICATION || "",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  alternateName: "SavePalace",
  url: siteUrl,
  description: siteDescription,
  inLanguage: "ko-KR",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  alternateName: "SavePalace",
  url: siteUrl,
  description: siteDescription,
  sameAs: ["https://www.tamnacoupon.co.kr"],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "알리익스프레스 쿠폰 어디서 구하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "절약왕궁(savepalace.co.kr)에서 매일 최신 알리익스프레스 쿠폰코드를 무료로 확인하고 복사하실 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "알리익스프레스 쿠폰 사용 방법은?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "장바구니에 조건 금액 이상 담은 후 결제창에서 '할인코드' 항목에 코드를 입력하고 '적용하기'를 누르면 됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "알리익스프레스 쿠폰이 적용이 안 될 때는?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "쿠폰의 최소 구매 조건을 확인하고, 만료일이 지나지 않았는지 확인하세요. 일부 쿠폰은 앱에서만 사용 가능하거나 신규 회원 전용일 수 있습니다.",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* 다크모드 FOUC 방지 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('sp-theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </head>
      <body className="antialiased">
        <VisitorTracker />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
