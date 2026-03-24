import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const COUPON_DB_ID = process.env.NOTION_COUPON_DB_ID!;
