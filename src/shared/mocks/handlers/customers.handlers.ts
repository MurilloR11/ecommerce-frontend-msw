import { http } from 'msw'

import { getCustomersList } from '../customers/service'
import { applyNetworkDelay, forcedErrorResponse, isForcedError } from '../http/resilience'
import { jsonOk } from '../http/responses'
import { API_BASE_PATH } from './constants'

export const customersHandlers = [
  http.get(`${API_BASE_PATH}/customers`, async ({ request }) => {
    const url = new URL(request.url)
    await applyNetworkDelay()
    if (isForcedError(url.searchParams)) return forcedErrorResponse()

    return jsonOk(getCustomersList(url))
  }),
]
