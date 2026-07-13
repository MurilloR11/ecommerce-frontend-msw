/** Returns the raw string only if it parses to a real instant; otherwise the bound is ignored. */
export function parseIsoDate(raw: string | null): string | undefined {
  if (raw === null || raw.trim() === '') return undefined
  return Number.isNaN(Date.parse(raw)) ? undefined : raw
}
