export type Coupon = {
  id: number;
  brand: string;
  notionPageId?: string;
  event: string;
  title: string;
  code: string;
  minPurchase: string;
  discountAmount: string;
  startsAt?: string;
  expiresAt: string;
  tip: string;
  url?: string;
};
