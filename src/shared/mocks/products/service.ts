import type { Product } from '@/entities/product'
import type { PaginatedResponse } from '@/shared/api/types'

import { productsDb } from '../data'
import { parsePageParams } from '../pagination/parse-page-params'
import { paginate } from '../pagination/paginate'

/** No filtering/sorting is required for this resource yet — newest first keeps pagination deterministic. */
const productsByCreatedAtDesc = [...productsDb].sort(
  (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
)

export function getProductsList(url: URL): PaginatedResponse<Product> {
  const pageParams = parsePageParams(url.searchParams)
  return paginate(productsByCreatedAtDesc, pageParams)
}
