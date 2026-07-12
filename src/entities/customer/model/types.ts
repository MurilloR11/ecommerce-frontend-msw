export const CUSTOMER_SEGMENTS = ["new", "returning", "vip"] as const;
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];

export interface Customer {
  id: string;
  name: string;
  email: string;
  segment: CustomerSegment;
  isActive: boolean;
  country: string;
  /** Lifetime spend in cents. */
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
}
