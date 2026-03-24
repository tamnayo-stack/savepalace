export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashIp, tryRecordCouponClick } from "@/lib/visitor-stats-store";
import { sendTelegram } from "@/lib/telegram";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const CLICKS_DB_ID =
  process.env.NOTION_CLICKS_DB_ID || "31fbbf9f-1786-8145-af21-c5816da5be4d";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${NOTION_TOKEN!}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };
}

async function findClickRecord(code: string, date: string) {
  const res = await fetch(`https://api.notion.com/v1/databases/${CLICKS_DB_ID}/query`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: {
        and: [
          { property: "쿠폰코드", title: { equals: code } },
          { property: "날짜", date: { equals: date } },
        ],
      },
      page_size: 1,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { results: Array<Record<string, unknown>> };
  const page = data.results[0];
  if (!page) return null;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const props = page.properties as Record<string, any>;
  return { id: page.id as string, clicks: props["클릭수"]?.number ?? 0 };
}

export async function GET(request: NextRequest) {
  if (!NOTION_TOKEN) return NextResponse.json({ clicks: 0, all: {} });
  const code = request.nextUrl.searchParams.get("code") ?? "";

  if (code) {
    try {
      const record = await findClickRecord(code, todayStr());
      return NextResponse.json({ clicks: record?.clicks ?? 0 });
    } catch {
      return NextResponse.json({ clicks: 0 });
    }
  }

  // 전체 조회
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${CLICKS_DB_ID}/query`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: { property: "날짜", date: { equals: todayStr() } },
        page_size: 100,
      }),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ all: {} });
    const data = (await res.json()) as { results: Array<Record<string, unknown>> };
    const all: Record<string, number> = {};
    for (const page of data.results) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const props = page.properties as Record<string, any>;
      const c = props["쿠폰코드"]?.title?.[0]?.plain_text as string | undefined;
      const n = props["클릭수"]?.number as number | undefined;
      if (c) all[c] = n ?? 0;
    }
    return NextResponse.json({ all });
  } catch {
    return NextResponse.json({ all: {} });
  }
}

export async function POST(request: NextRequest) {
  if (!NOTION_TOKEN) return NextResponse.json({ ok: false }, { status: 503 });

  let code = "";
  let visitorNumber = 0;
  let visitCount = 0;
  try {
    const body = (await request.json()) as { code?: string; visitorNumber?: number; visitCount?: number };
    code = typeof body.code === "string" ? body.code : "";
    visitorNumber = typeof body.visitorNumber === "number" ? body.visitorNumber : 0;
    visitCount = typeof body.visitCount === "number" ? body.visitCount : 0;
  } catch { /* ignore */ }
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const allowed = tryRecordCouponClick(code, hashIp(ip));
  const date = todayStr();

  if (!allowed) {
    const record = await findClickRecord(code, date);
    return NextResponse.json({ ok: true, clicks: record?.clicks ?? 0, deduplicated: true });
  }

  try {
    const existing = await findClickRecord(code, date);
    let newClicks: number;

    if (existing) {
      newClicks = existing.clicks + 1;
      await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
        method: "PATCH",
        headers: notionHeaders(),
        body: JSON.stringify({ properties: { 클릭수: { number: newClicks } } }),
      });
    } else {
      newClicks = 1;
      await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: notionHeaders(),
        body: JSON.stringify({
          parent: { database_id: CLICKS_DB_ID },
          properties: {
            쿠폰코드: { title: [{ text: { content: code } }] },
            날짜: { date: { start: date } },
            클릭수: { number: 1 },
          },
        }),
      });
    }

    const visitorTag = visitorNumber
      ? `방문자 #${visitorNumber.toLocaleString("ko-KR")} · ${visitCount}번째 방문`
      : "방문자 정보 없음";

    await sendTelegram(
      `💰 <b>쿠폰 복사! [절약왕궁]</b>\n\n` +
      `👤 ${visitorTag}\n` +
      `🎟 코드: <code>${code}</code>\n` +
      `📊 오늘 누적: ${newClicks}회`
    );

    return NextResponse.json({ ok: true, clicks: newClicks });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : "오류" }, { status: 500 });
  }
}
