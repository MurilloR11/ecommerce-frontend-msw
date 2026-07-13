import type { Order, OrderSortableField } from '@/entities/order'

import type { Comparator } from '../sorting/types'

export const ORDER_SORT_COMPARATORS: Record<OrderSortableField, Comparator<Order>> = {
  createdAt: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  totalAmount: (a, b) => a.totalAmount - b.totalAmount,
  status: (a, b) => a.status.localeCompare(b.status),
}
