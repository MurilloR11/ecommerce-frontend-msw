import type { Currency, OrderSortableField, OrderStatus, PaymentMethod } from '@/entities/order'
import {
  CURRENCIES,
  ORDER_SORTABLE_FIELDS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
} from '@/entities/order'
import type { CustomerSegment } from '@/entities/customer'
import { CUSTOMER_SEGMENTS } from '@/entities/customer'

import { parseEnumCsv } from '../filters/parse-enum-csv'
import { parseIsoDate } from '../filters/parse-iso-date'
import { parseNonNegativeNumber } from '../filters/parse-non-negative-number'
import { parseOptionalString } from '../filters/parse-optional-string'
import { parsePageParams } from '../pagination/parse-page-params'
import { parseSortParam } from '../sorting/parse-sort-param'
import type { SortInstruction } from '../sorting/types'

/**
 * Sanitized, always-defined shape produced by the border/parsing layer.
 * Distinct from `entities/order`'s `OrdersQueryParams` on purpose: that type
 * is the client-facing contract (all fields optional, as a caller would
 * write them), this one is what the server-side pipeline actually consumes
 * after every anomaly has been resolved to a safe default.
 */
export interface ParsedOrdersQuery {
  page: number
  limit: number
  status?: OrderStatus[]
  paymentMethod?: PaymentMethod[]
  currency?: Currency[]
  segment?: CustomerSegment[]
  customerId?: string
  dateFrom?: string
  dateTo?: string
  minTotal?: number
  maxTotal?: number
  search?: string
  sort: SortInstruction<OrderSortableField>
}

const DEFAULT_SORT: SortInstruction<OrderSortableField> = { field: 'createdAt', direction: 'desc' }

export function parseOrdersQuery(searchParams: URLSearchParams): ParsedOrdersQuery {
  const { page, limit } = parsePageParams(searchParams)

  return {
    page,
    limit,
    status: parseEnumCsv(searchParams.get('status'), ORDER_STATUSES),
    paymentMethod: parseEnumCsv(searchParams.get('paymentMethod'), PAYMENT_METHODS),
    currency: parseEnumCsv(searchParams.get('currency'), CURRENCIES),
    segment: parseEnumCsv(searchParams.get('segment'), CUSTOMER_SEGMENTS),
    customerId: parseOptionalString(searchParams.get('customerId')),
    dateFrom: parseIsoDate(searchParams.get('dateFrom')),
    dateTo: parseIsoDate(searchParams.get('dateTo')),
    minTotal: parseNonNegativeNumber(searchParams.get('minTotal')),
    maxTotal: parseNonNegativeNumber(searchParams.get('maxTotal')),
    search: parseOptionalString(searchParams.get('search')),
    sort: parseSortParam(searchParams.get('sort'), ORDER_SORTABLE_FIELDS, DEFAULT_SORT),
  }
}
