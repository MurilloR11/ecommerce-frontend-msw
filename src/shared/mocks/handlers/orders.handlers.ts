import { http } from 'msw'

import { applyNetworkDelay, forcedErrorResponse, isForcedError } from '../http/resilience'
import { jsonError, jsonOk } from '../http/responses'
import { getOrderById, getOrdersList } from '../orders/service'
import { API_BASE_PATH } from './constants'

export const ordersHandlers = [
  http.get(`${API_BASE_PATH}/orders`, async ({ request }) => {
    const url = new URL(request.url)
    await applyNetworkDelay()
    if (isForcedError(url.searchParams)) return forcedErrorResponse()

    return jsonOk(getOrdersList(url))
  }),

  http.get(`${API_BASE_PATH}/orders/:id`, async ({ request, params }) => {
    const url = new URL(request.url)
    await applyNetworkDelay()
    if (isForcedError(url.searchParams)) return forcedErrorResponse()

    const { id } = params
    const order = typeof id === 'string' ? getOrderById(id) : undefined
    if (!order) {
      return jsonError(404, 'ORDER_NOT_FOUND', `No order found with id "${String(id)}".`)
    }

    return jsonOk(order)
  }),
]
