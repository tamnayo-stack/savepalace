/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from "next/cache";
import { notion, COUPON_DB_ID } from "@/lib/notion-client";
import type { Coupon } from "@/lib/coupon-types";

function extractText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title ?? []).map((t: any) => t.plain_text).join("");
  if (prop.type === "rich_text") return (prop.rich_text ?? []).map((t: any) => t.plain_text).join("");
  if (prop.type === "date") return prop.date?.start ?? "";
  if (prop.type === "url") return prop.url ?? "";
  if (prop.type === "select") return prop.select?.name ?? "";
  return "";
}

function pageToCoupon(page: any, index: number): Coupon {
  const p = page.properties ?? {};
  const event = extractText(p["행사명"]);
  const code = extractText(p["할인코드"]);
  const discountAmount = extractText(p["할인금액"]);

  return {
    id: index + 1,
    brand: extractText(p["제목"]) || "aliexpress",
    notionPageId: page.id as string,
    event,
    title: event ? `${event} - ${discountAmount || code}` : code,
    code,
    minPurchase: extractText(p["구매조건"]),
    discountAmount,
    startsAt: extractText(p["시작일"]) || undefined,
    expiresAt: extractText(p["만료일"]),
    tip: "",
    url: p["링크"]?.url ?? "",
  };
}

// 알리익스프레스 쿠폰만 조회 (savepalace는 aliexpress 전용)
const _fetchAliCoupons = unstable_cache(
  async (): Promise<Coupon[]> => {
    const response = await notion.databases.query({
      database_id: COUPON_DB_ID,
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
      filter: {
        and: [
          { property: "할인코드", rich_text: { is_not_empty: true } },
          {
            or: [
              { property: "제목", select: { equals: "aliexpress" } },
              { property: "제목", select: { is_empty: true } },
            ],
          },
        ],
      },
    });
    return response.results
      .filter((p) => p.object === "page" && !(p as any).archived)
      .map((p, i) => pageToCoupon(p, i));
  },
  ["savepalace-ali-coupons"],
  { revalidate: 60, tags: ["coupons"] },
);

export async function getAliCoupons(): Promise<Coupon[]> {
  return _fetchAliCoupons();
}
