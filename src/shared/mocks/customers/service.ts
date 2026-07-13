import type { Customer } from '@/entities/customer'
import type { PaginatedResponse } from '@/shared/api/types'

import { customersDb } from '../data'
import { parsePageParams } from '../pagination/parse-page-params'
import { paginate } from '../pagination/paginate'

/** No filtering/sorting is required for this resource yet — newest first keeps pagination deterministic. */
const customersByCreatedAtDesc = [...customersDb].sort(
  (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
)

export function getCustomersList(url: URL): PaginatedResponse<Customer> {
  const pageParams = parsePageParams(url.searchParams)
  return paginate(customersByCreatedAtDesc, pageParams)
}
