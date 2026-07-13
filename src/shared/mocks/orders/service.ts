import type { Order, OrdersListResponse } from '@/entities/order'

import { customersDb, ordersDb } from '../data'
import { paginate } from '../pagination/paginate'
import { applySort } from '../sorting/apply-sort'
import { computeOrdersAggregates } from './aggregates'
import { buildCustomerSegmentIndex } from './customer-segment-index'
import { filterOrders } from './filters'
import { parseOrdersQuery } from './schema'
import { ORDER_SORT_COMPARATORS } from './sort-comparators'

/** The customers dataset is static for the lifetime of the mock server, so the index is built once. */
const customerSegmentIndex = buildCustomerSegmentIndex(customersDb)

/**
 * Orchestrates the mandated pipeline order: parse -> filter -> aggregate ->
 * sort -> paginate. Each step is delegated to its own module — this function
 * only wires them together, it holds no filtering/pagination logic itself.
 */
export function getOrdersList(url: URL): OrdersListResponse {
  const query = parseOrdersQuery(url.searchParams)

  const filtered = filterOrders(ordersDb, query, customerSegmentIndex)
  const aggregates = computeOrdersAggregates(filtered)

  const sorted = applySort(filtered, query.sort, ORDER_SORT_COMPARATORS)
  const { data, meta } = paginate(sorted, { page: query.page, limit: query.limit })

  return { data, meta, aggregates }
}

export function getOrderById(id: string): Order | undefined {
  return ordersDb.find((order) => order.id === id)
}
