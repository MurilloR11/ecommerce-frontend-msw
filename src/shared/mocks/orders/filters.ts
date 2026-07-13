import type { Order } from '@/entities/order'

import type { CustomerSegmentIndex } from './customer-segment-index'
import type { ParsedOrdersQuery } from './schema'

/**
 * Each predicate owns exactly one field so filters stay independently
 * testable and addable — `filterOrders` only wires them together with AND.
 * Multi-value fields (status/paymentMethod/currency/segment) apply OR
 * internally via `Array#includes` against the CSV values resolved upstream.
 */

function matchesStatus(order: Order, statuses: ParsedOrdersQuery['status']): boolean {
  return !statuses || statuses.includes(order.status)
}

function matchesPaymentMethod(order: Order, methods: ParsedOrdersQuery['paymentMethod']): boolean {
  return !methods || methods.includes(order.paymentMethod)
}

function matchesCurrency(order: Order, currencies: ParsedOrdersQuery['currency']): boolean {
  return !currencies || currencies.includes(order.currency)
}

/**
 * Matches against the customer's *current* segment (see `CustomerSegmentIndex`
 * doc) — a historical order counts if its customer is `vip` today, regardless
 * of what they were when the order was placed. Intentional, not a bug.
 */
function matchesSegment(
  order: Order,
  segments: ParsedOrdersQuery['segment'],
  segmentIndex: CustomerSegmentIndex,
): boolean {
  if (!segments) return true
  const segment = segmentIndex.get(order.customerId)
  return segment !== undefined && segments.includes(segment)
}

function matchesCustomerId(order: Order, customerId: ParsedOrdersQuery['customerId']): boolean {
  return !customerId || order.customerId === customerId
}

function matchesDateRange(
  order: Order,
  dateFrom: ParsedOrdersQuery['dateFrom'],
  dateTo: ParsedOrdersQuery['dateTo'],
): boolean {
  const createdAt = Date.parse(order.createdAt)
  if (dateFrom && createdAt < Date.parse(dateFrom)) return false
  if (dateTo && createdAt > Date.parse(dateTo)) return false
  return true
}

function matchesAmountRange(
  order: Order,
  minTotal: ParsedOrdersQuery['minTotal'],
  maxTotal: ParsedOrdersQuery['maxTotal'],
): boolean {
  if (minTotal !== undefined && order.totalAmount < minTotal) return false
  if (maxTotal !== undefined && order.totalAmount > maxTotal) return false
  return true
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase()
}

function matchesSearch(order: Order, search: ParsedOrdersQuery['search']): boolean {
  if (!search) return true
  const needle = normalizeSearchText(search)
  return (
    normalizeSearchText(order.orderNumber).includes(needle) ||
    normalizeSearchText(order.customerSnapshot.name).includes(needle)
  )
}

export function filterOrders(
  orders: readonly Order[],
  query: ParsedOrdersQuery,
  segmentIndex: CustomerSegmentIndex,
): Order[] {
  return orders.filter(
    (order) =>
      matchesStatus(order, query.status) &&
      matchesPaymentMethod(order, query.paymentMethod) &&
      matchesCurrency(order, query.currency) &&
      matchesSegment(order, query.segment, segmentIndex) &&
      matchesCustomerId(order, query.customerId) &&
      matchesDateRange(order, query.dateFrom, query.dateTo) &&
      matchesAmountRange(order, query.minTotal, query.maxTotal) &&
      matchesSearch(order, query.search),
  )
}
