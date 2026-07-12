import type { CustomerOrderSnapshot } from "@/entities/customer/@x/order";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  /** Unit price in cents. */
  price: number;
  /** quantity * price, in cents. */
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  /** Point-in-time customer snapshot for list/detail views without a join. */
  customerSnapshot: CustomerOrderSnapshot;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  currency: Currency;
  items: OrderItem[];
  itemsCount: number;
  /** Sum of item totals in cents, before shipping and tax. */
  subtotal: number;
  /** Shipping cost in cents. */
  shipping: number;
  /** Tax amount in cents. */
  tax: number;
  /** subtotal + shipping + tax, in cents. */
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
