import type { PaginatedResponse, PaginationMeta } from '@/shared/api/types'

import type { ParsedPageParams } from './types'

/** Slices an already filtered+sorted collection and derives its pagination metadata. */
export function paginate<TItem>(
  items: readonly TItem[],
  params: ParsedPageParams,
): PaginatedResponse<TItem> {
  const totalCount = items.length
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / params.limit)
  const start = (params.page - 1) * params.limit
  const data = items.slice(start, start + params.limit)
  const meta: PaginationMeta = { page: params.page, limit: params.limit, totalCount, totalPages }
  return { data, meta }
}
