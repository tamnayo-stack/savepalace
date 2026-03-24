import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashIp, checkAndRegisterVisitor, getOperatorIps } from "@/lib/visitor-stats-store";
import { tryRecordVisit, shouldNotifyVisitor } from "@/lib/visitor-dedup";
import { sendTelegram } from "@/lib/telegram";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const VISITORS_DB_ID = process.env.NOTION_VISITORS_DB_ID || "";

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|archiv|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|outbrain|pinterest|vkshare|w3c_validator|whatsapp|googlebot|bingbot|yandex|baidu|semrush|ahrefs|mj12bot|dotbot|seznambot|petalbot|bytespider|gptbot|ccbot|applebot|claudebot|anthropic|openai|headless|puppeteer|playwright|selenium|phantomjs|prerender|screaming|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|newrelic|nagios|zabbix|datadog|python-requests|go-http|java\/|curl\/|wget\/|libwww|okhttp|axios\/[0-9]|node-fetch/i;

const BOT_IP_PATTERN =
  /^(66\.249\.|74\.125\.|64\.233\.|66\.102\.|209\.85\.|34\.|35\.|142\.250\.|172\.217\.|216\.58\.|104\.197\.|17\.|173\.252\.|31\.13\.|69\.63\.|157\.240\.|179\.60\.|52\.|54\.|3\.|18\.|13\.|104\.28\.|104\.16\.|172\.68\.|162\.158\.|198\.41\.|62\.210\.|51\.158\.|40\.77\.|157\.55\.|207\.46\.|199\.16\.)/;

function parseDevice(ua: string): string {
  if (!ua) return "알 수 없음";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) {
    const m = ua.match(/Android[^;]*;\s*([^)]+)\)/);
    return m ? `Android - ${m[1].trim()}` : "Android";
  }
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Linux/.test(ua)) return "Linux PC";
  return "기타";
}

const UTM_SOURCE_LABEL: Record<string, string> = {
  instagram: "SNS (instagram.com)", insta: "SNS (instagram.com)", ig: "SNS (instagram.com)",
  x: "SNS (x.com)", twitter: "SNS (x.com)", threads: "SNS (threads.net)",
  youtube: "SNS (youtube.com)", yt: "SNS (youtube.com)", tiktok: "SNS (tiktok.com)",
  kakaotalk: "SNS (kakaotalk)", kakao: "SNS (kakaotalk)", facebook: "SNS (facebook.com)",
  naver: "검색 (naver.com)", google: "검색 (google.com)", blog: "블로그",
};

function parseSource(referrer: string, currentHost: string, utmSource?: string): string {
  if (utmSource) {
    const key = utmSource.toLowerCase().trim();
    return UTM_SOURCE_LABEL[key] ?? `UTM (${utmSource})`;
  }
  if (!referrer) return "직접접속";
  try {
    const ref = new URL(referrer);
    if (ref.hostname === currentHost) return "내부이동";
    const h = ref.hostname.replace("www.", "");
    if (/google\.|naver\.com|daum\.net|bing\.com|yahoo\.com|duckduckgo\.com/.test(h)) return `검색 (${h})`;
    if (/instagram\.com|facebook\.com|twitter\.com|x\.com|kakao\.com|threads\.net|youtube\.com|tiktok\.com/.test(h)) return `SNS (${h})`;
    return `클릭 (${h})`;
  } catch { return "기타"; }
}

async function getGeoInfo(ip: string): Promise<{ country: string; region: string }> {
  const fallback = { country: "알 수 없음", region: "" };
  if (!ip || ip === "알 수 없음" || /^(127\.|::1|192\.168\.|10\.)/.test(ip))
    return { country: "로컬", region: "" };
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city&lang=ko`,
      { signal: AbortSignal.timeout(2000) },
    );
    if (!res.ok) return fallback;
    const d = (await res.json()) as { status?: string; country?: string; regionName?: string; city?: string };
    if (d.status !== "success") return fallback;
    return {
      country: d.country ?? "알 수 없음",
      region: [d.regionName, d.city].filter(Boolean).join(" · "),
    };
  } catch { return fallback; }
}

export async function POST(request: NextRequest) {
  if (!NOTION_TOKEN) return NextResponse.json({ ok: false }, { status: 503 });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "알 수 없음";
  const ua = request.headers.get("user-agent") || "";

  if (BOT_UA_PATTERN.test(ua) || BOT_IP_PATTERN.test(ip)) return NextResponse.json({ ok: true });

  const device = parseDevice(ua);
  let page = "/", referrer = "", utmSource = "";
  try {
    const body = (await request.json()) as { page?: string; referrer?: string; utmSource?: string };
    page = typeof body.page === "string" ? body.page : "/";
    referrer = typeof body.referrer === "string" ? body.referrer : "";
    utmSource = typeof body.utmSource === "string" ? body.utmSource : "";
  } catch { /* ignore */ }

  const ipHash = hashIp(ip);
  const shouldRecord = await tryRecordVisit(ipHash, page);
  if (!shouldRecord) return NextResponse.json({ ok: true });

  const host = request.headers.get("host") ?? "";
  const source = parseSource(referrer, host, utmSource || undefined);
  const isInternalNav = source === "내부이동";

  const [geo, operatorIps] = await Promise.all([getGeoInfo(ip), getOperatorIps()]);
  const geoStr = [geo.country, geo.region].filter(Boolean).join(" · ");
  const visitorCheck = await checkAndRegisterVisitor(ip, geoStr);
  const isOperator = operatorIps.includes(ip);

  // Notion에 방문 기록
  try {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: VISITORS_DB_ID },
        properties: {
          이름: { title: [{ text: { content: `[절약왕궁] ${ip} — ${page}` } }] },
          IP: { rich_text: [{ text: { content: ip } }] },
          기기: { rich_text: [{ text: { content: device } }] },
          페이지: { rich_text: [{ text: { content: page } }] },
          "국가·지역": { rich_text: [{ text: { content: geoStr } }] },
          유입경로: { rich_text: [{ text: { content: source } }] },
          접속시각: { rich_text: [{ text: { content: new Date().toISOString() } }] },
        },
      }),
    });
  } catch (e) {
    console.error("[savepalace/visitor-log] Notion error:", e);
  }

  const isForeignBot = geo.country === "United States" || geo.country === "알 수 없음";
  const canNotify = !isInternalNav && shouldNotifyVisitor(ipHash);
  const { isNew, visitorNumber, visitCount, isFirstCountry } = visitorCheck;

  if (!isOperator && !isForeignBot && canNotify) {
    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    const numStr = visitorNumber ? `#${visitorNumber.toLocaleString("ko-KR")}` : "";
    const visitStr = visitCount === 1 ? "첫 방문" : `${visitCount}번째 방문`;

    if (isNew) {
      await sendTelegram(
        `👑 <b>[절약왕궁] ${visitorNumber.toLocaleString("ko-KR")}번째 방문자</b> · ${visitStr}\n\n` +
        `📱 ${device}\n🌍 ${geoStr || "알 수 없음"}\n📄 ${page}\n🔗 ${source}\n⏰ ${now}`
      );
    } else {
      await sendTelegram(
        `🔄 <b>[절약왕궁] 재방문자 ${numStr}</b> · ${visitStr}\n\n` +
        `📱 ${device}\n🌍 ${geoStr || "알 수 없음"}\n📄 ${page}\n🔗 ${source}\n⏰ ${now}`
      );
    }

    if (isFirstCountry && geo.country) {
      await sendTelegram(
        `🌏 <b>[절약왕궁] ${geo.country} 첫 방문자!</b>\n방문자 ${numStr} · ${geoStr}\n⏰ ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`
      );
    }
  }

  return NextResponse.json({ ok: true, visitorNumber, visitCount }, { status: 201 });
}
