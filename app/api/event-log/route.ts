import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendTelegram } from "@/lib/telegram";
import { getOperatorIps } from "@/lib/visitor-stats-store";

const BOT_IP_PATTERN =
  /^(66\.249\.|74\.125\.|64\.233\.|66\.102\.|209\.85\.|34\.|35\.|17\.|173\.252\.|31\.13\.|69\.63\.|52\.|54\.|3\.|18\.|13\.|104\.|172\.68\.|162\.158\.|199\.16\.)/;

function parseDevice(ua: string): string {
  if (!ua) return "알 수 없음";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Linux/.test(ua)) return "Linux PC";
  return "기타";
}

const EVENT_LABELS: Record<string, string> = {
  coupon_copy: "쿠폰 복사",
  coupon_click: "쿠폰 링크 클릭",
  search: "검색",
};

const EVENT_ICONS: Record<string, string> = {
  coupon_copy: "📋",
  coupon_click: "🔗",
  search: "🔍",
};

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "알 수 없음";

  if (BOT_IP_PATTERN.test(ip)) return NextResponse.json({ ok: true });

  const operatorIps = await getOperatorIps();
  const isOperator = operatorIps.includes(ip);
  const ua = request.headers.get("user-agent") || "";
  const device = parseDevice(ua);

  let type = "", label = "", page = "/", visitorNumber = 0, visitCount = 0;
  try {
    const body = (await request.json()) as {
      type?: string; label?: string; page?: string; visitorNumber?: number; visitCount?: number;
    };
    type = typeof body.type === "string" ? body.type : "";
    label = typeof body.label === "string" ? body.label : "";
    page = typeof body.page === "string" ? body.page : "/";
    visitorNumber = typeof body.visitorNumber === "number" ? body.visitorNumber : 0;
    visitCount = typeof body.visitCount === "number" ? body.visitCount : 0;
  } catch { /* ignore */ }

  if (!type) return NextResponse.json({ ok: false }, { status: 400 });

  if (!isOperator) {
    const typeLabel = EVENT_LABELS[type] ?? type;
    const icon = EVENT_ICONS[type] ?? "👆";
    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    const visitorStr = visitorNumber
      ? `👤 #${visitorNumber.toLocaleString("ko-KR")}번 방문자${visitCount ? ` · ${visitCount}번째 방문` : ""}\n`
      : "";

    await sendTelegram(
      `${icon} <b>[절약왕궁] ${typeLabel}</b>\n` +
      `📱 ${device}\n📄 ${page}\n` +
      (label ? `🏷️ ${label}\n` : "") +
      visitorStr +
      `⏰ ${now}`
    );
  }

  return NextResponse.json({ ok: true });
}
