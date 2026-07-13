import type { Order, OrderStatus, OrdersAggregates } from '@/entities/order'

const REVENUE_STATUSES: ReadonlySet<OrderStatus> = new Set(['paid', 'shipped', 'delivered'])

function countByStatus(orders: readonly Order[], status: OrderStatus): number {
  return orders.reduce((count, order) => (order.status === status ? count + 1 : count), 0)
}

/** Must run on the filtered subset, before pagination slices it down — never on the full dataset. */
export function computeOrdersAggregates(orders: readonly Order[]): OrdersAggregates {
  const revenueOrders = orders.filter((order) => REVENUE_STATUSES.has(order.status))
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const averageOrderValue =
    revenueOrders.length > 0 ? Math.round(totalRevenue / revenueOrders.length) : 0

  return {
    totalRevenue,
    averageOrderValue,
    pendingOrdersCount: countByStatus(orders, 'pending'),
    paidOrdersCount: countByStatus(orders, 'paid'),
    shippedOrdersCount: countByStatus(orders, 'shipped'),
    deliveredOrdersCount: countByStatus(orders, 'delivered'),
    cancelledOrdersCount: countByStatus(orders, 'cancelled'),
    refundedOrdersCount: countByStatus(orders, 'refunded'),
  }
}
