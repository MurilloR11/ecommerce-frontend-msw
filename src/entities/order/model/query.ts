import type { CustomerSegment } from "@/entities/customer";
import type { Currency, OrderStatus, PaymentMethod } from "./types";

export const ORDER_SORTABLE_FIELDS = ["createdAt", "totalAmount", "status"] as const;
export type OrderSortableField = (typeof ORDER_SORTABLE_FIELDS)[number];

export type SortDirection = "asc" | "desc";

export type SortParam = `${OrderSortableField}:${SortDirection}`;

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  /** Multi-select — e.g. filter by paid AND shipped at once. */
  status?: OrderStatus[];
  customerId?: string;
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  segment?: CustomerSegment;
  country?: string;
  /** ISO date string, inclusive lower bound on createdAt. */
  dateFrom?: string;
  /** ISO date string, inclusive upper bound on createdAt. */
  dateTo?: string;
  /** Minimum totalAmount in cents. */
  minTotal?: number;
  /** Maximum totalAmount in cents. */
  maxTotal?: number;
  /** Free-text match against orderNumber, customer name or email. */
  search?: string;
  sort?: SortParam;
}

export interface OrdersAggregates {
  /** Sum of totalAmount across paid, shipped and delivered orders, in cents. */
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrdersCount: number;
  paidOrdersCount: number;
  shippedOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  refundedOrdersCount: number;
}
