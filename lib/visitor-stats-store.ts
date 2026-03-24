import { createHash } from "node:crypto";

const NOTION_TOKEN = process.env.NOTION_TOKEN ?? "";
const VISITORS_DB_ID = process.env.NOTION_VISITORS_DB_ID ?? "";

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT ?? "savepalace-salt"))
    .digest("hex")
    .slice(0, 16);
}

type LoadedStats = {
  seenIPs: Set<string>;
  ipVisitorNumbers: Map<string, number>;
  ipVisitCounts: Map<string, number>;
  seenCountries: Set<string>;
  uniqueTotal: number;
};

let _stats: LoadedStats | null = null;
let _initPromise: Promise<LoadedStats> | null = null;

async function loadAllStats(): Promise<LoadedStats> {
  const seenIPs = new Set<string>();
  const ipVisitorNumbers = new Map<string, number>();
  const ipVisitCounts = new Map<string, number>();
  const seenCountries = new Set<string>();
  let uniqueTotal = 0;

  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const body: Record<string, unknown> = {
      page_size: 100,
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
    };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(
      `https://api.notion.com/v1/databases/${VISITORS_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!res.ok) break;

    const data = (await res.json()) as {
      results: Array<{
        properties?: {
          IP?: { rich_text?: Array<{ plain_text?: string }> };
          "국가·지역"?: { rich_text?: Array<{ plain_text?: string }> };
        };
      }>;
      has_more: boolean;
      next_cursor?: string;
    };

    for (const page of data.results) {
      const ip = page.properties?.IP?.rich_text?.[0]?.plain_text ?? "";
      const geoRaw = page.properties?.["국가·지역"]?.rich_text?.[0]?.plain_text ?? "";
      const country = geoRaw.split(" · ")[0].trim();

      if (ip && ip !== "알 수 없음") {
        if (!seenIPs.has(ip)) {
          seenIPs.add(ip);
          uniqueTotal++;
          ipVisitorNumbers.set(ip, uniqueTotal);
        }
        ipVisitCounts.set(ip, (ipVisitCounts.get(ip) ?? 0) + 1);
      }

      if (country && country !== "알 수 없음" && country !== "로컬") {
        seenCountries.add(country);
      }
    }

    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return { seenIPs, ipVisitorNumbers, ipVisitCounts, seenCountries, uniqueTotal };
}

async function ensureLoaded(): Promise<LoadedStats> {
  if (_stats !== null) return _stats;
  if (!_initPromise) _initPromise = loadAllStats();
  _stats = await _initPromise;
  return _stats;
}

export type VisitorCheckResult = {
  isNew: boolean;
  visitorNumber: number;
  visitCount: number;
  isFirstCountry: boolean;
};

export async function checkAndRegisterVisitor(
  ip: string,
  geoStr: string,
): Promise<VisitorCheckResult> {
  if (!ip || ip === "알 수 없음") {
    return { isNew: false, visitorNumber: 0, visitCount: 0, isFirstCountry: false };
  }

  const stats = await ensureLoaded();

  const isNew = !stats.seenIPs.has(ip);
  const prevVisitCount = stats.ipVisitCounts.get(ip) ?? 0;
  const visitCount = prevVisitCount + 1;

  const country = geoStr.split(" · ")[0].trim();
  const isFirstCountry =
    !!country &&
    country !== "알 수 없음" &&
    country !== "로컬" &&
    !stats.seenCountries.has(country);

  stats.seenIPs.add(ip);
  stats.ipVisitCounts.set(ip, visitCount);
  if (country && country !== "알 수 없음" && country !== "로컬") {
    stats.seenCountries.add(country);
  }

  let visitorNumber: number;
  if (isNew) {
    stats.uniqueTotal++;
    visitorNumber = stats.uniqueTotal;
    stats.ipVisitorNumbers.set(ip, visitorNumber);
  } else {
    visitorNumber = stats.ipVisitorNumbers.get(ip) ?? 0;
  }

  return { isNew, visitorNumber, visitCount, isFirstCountry };
}

// 쿠폰 클릭 중복 방지 (하루 1회)
const couponClickMap = new Map<string, string>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function tryRecordCouponClick(code: string, ipHash: string): boolean {
  const key = `${code}-${ipHash}`;
  const t = today();
  if (couponClickMap.get(key) === t) return false;
  couponClickMap.set(key, t);
  return true;
}

// 운영자 IP 조회
export async function getOperatorIps(): Promise<string[]> {
  if (!NOTION_TOKEN || !VISITORS_DB_ID) return [];
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${VISITORS_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: { property: "이름", title: { starts_with: "[운영자]" } },
          page_size: 50,
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { results: Array<Record<string, unknown>> };
    return data.results
      .filter((p) => !p.archived)
      .map((p) => {
        const props = (p.properties ?? {}) as Record<string, unknown>;
        const arr = ((props["이름"] as Record<string, unknown>)?.title as Array<{ plain_text: string }>) ?? [];
        const title = arr.map((t) => t.plain_text).join("");
        return title.replace("[운영자] ", "").trim();
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
