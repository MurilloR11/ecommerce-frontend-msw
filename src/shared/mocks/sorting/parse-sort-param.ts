import type { SortInstruction } from './types'

/** A corrupted or unknown `field:direction` pair maps to `fallback` instead of failing the request. */
export function parseSortParam<TField extends string>(
  raw: string | null,
  allowedFields: readonly TField[],
  fallback: SortInstruction<TField>,
): SortInstruction<TField> {
  if (raw === null) return fallback

  const [field, direction] = raw.split(':')
  if (!field || !direction) return fallback
  if (!allowedFields.includes(field as TField)) return fallback
  if (direction !== 'asc' && direction !== 'desc') return fallback

  return { field: field as TField, direction }
}
