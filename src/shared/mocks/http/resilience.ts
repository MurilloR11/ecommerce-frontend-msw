import { delay } from 'msw'

import { jsonError } from './responses'

const MIN_DELAY_MS = 300
const MAX_DELAY_MS = 800

const FORCE_ERROR_PARAM = 'forceError'

/** Simulates realistic network jitter so the client always exercises its loading state. */
export async function applyNetworkDelay(): Promise<void> {
  const jitter = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1))
  await delay(MIN_DELAY_MS + jitter)
}

/** Opt-in failure switch — append `?forceError=true` to any endpoint to certify error boundaries/skeletons. */
export function isForcedError(searchParams: URLSearchParams): boolean {
  return searchParams.get(FORCE_ERROR_PARAM) === 'true'
}

export function forcedErrorResponse() {
  return jsonError(500, 'FORCED_INTERNAL_ERROR', 'Simulated server failure (forceError=true).')
}
