/** Blank/whitespace-only values are treated as "no filter" rather than an empty string. */
export function parseOptionalString(raw: string | null): string | undefined {
  if (raw === null) return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
