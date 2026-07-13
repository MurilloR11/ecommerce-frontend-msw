import { http } from 'msw'

import { applyNetworkDelay, forcedErrorResponse, isForcedError } from '../http/resilience'
import { jsonOk } from '../http/responses'
import { getProductsList } from '../products/service'
import { API_BASE_PATH } from './constants'

export const productsHandlers = [
  http.get(`${API_BASE_PATH}/products`, async ({ request }) => {
    const url = new URL(request.url)
    await applyNetworkDelay()
    if (isForcedError(url.searchParams)) return forcedErrorResponse()

    return jsonOk(getProductsList(url))
  }),
]
