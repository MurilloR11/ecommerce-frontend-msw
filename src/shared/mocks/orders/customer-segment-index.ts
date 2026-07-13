import type { Customer, CustomerSegment } from '@/entities/customer'

/**
 * `segment` lives on `Customer`, not `Order` — `Order.customerSnapshot`
 * deliberately excludes it (see `entities/customer/@x/order.ts`) because it
 * drifts over time and a past order must not silently relabel itself when a
 * customer gets reclassified. Filtering orders by segment therefore needs an
 * explicit customerId -> segment cross-reference, built once from the
 * customers dataset and looked up in O(1) per order instead of re-scanning
 * customers for every row being filtered.
 *
 * That same drift makes this index a *current-segment* lookup, not a
 * point-in-time one: it maps every customer to whatever they are today, so
 * `segment=vip` pulls in a VIP's entire order history, including orders
 * placed back when they were `new`. That's the deliberate, documented
 * contract — see `OrdersQueryParams.segment` in `entities/order` for what
 * question this filter does and doesn't answer.
 */
export type CustomerSegmentIndex = ReadonlyMap<string, CustomerSegment>

export function buildCustomerSegmentIndex(customers: readonly Customer[]): CustomerSegmentIndex {
  return new Map(customers.map((customer) => [customer.id, customer.segment]))
}
