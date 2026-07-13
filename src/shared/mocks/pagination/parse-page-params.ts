import type { ParsedPageParams } from './types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Border parsing for a single positive-integer query param: NaN, decimals,
 * zero and negative values are anomalies that must never reach the rest of
 * the pipeline — they silently fall back to `fallback` instead of ever
 * throwing, per the "an invalid param must never break the server" rule.
 */
function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw === null) return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) return fallback
  return parsed
}

export function parsePageParams(searchParams: URLSearchParams): ParsedPageParams {
  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE)
  const requestedLimit = parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT)
  const limit = Math.min(requestedLimit, MAX_LIMIT)
  return { page, limit }
}
