/** Non-numeric or negative amounts are treated as "no bound" rather than an error. */
export function parseNonNegativeNumber(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}
