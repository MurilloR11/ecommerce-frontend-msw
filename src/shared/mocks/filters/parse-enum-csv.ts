/**
 * Parses a CSV query param (e.g. `status=paid,shipped`) into a de-duplicated
 * list of known enum values. Unknown tokens are dropped rather than
 * rejecting the whole param — one corrupted value must not take out the
 * other, valid ones. An empty/all-invalid result is `undefined` ("no
 * filter"), matching how every other optional filter here signals "skip me".
 */
export function parseEnumCsv<TValue extends string>(
  raw: string | null,
  allowedValues: readonly TValue[],
): TValue[] | undefined {
  if (raw === null || raw.trim() === '') return undefined

  const allowedSet = new Set<string>(allowedValues)
  const matched = raw
    .split(',')
    .map((token) => token.trim())
    .filter((token): token is TValue => allowedSet.has(token))

  const unique = Array.from(new Set(matched))
  return unique.length > 0 ? unique : undefined
}
