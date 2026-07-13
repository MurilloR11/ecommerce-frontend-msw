import type { Comparator, SortInstruction } from './types'

export function applySort<TItem, TField extends string>(
  items: readonly TItem[],
  instruction: SortInstruction<TField>,
  comparators: Record<TField, Comparator<TItem>>,
): TItem[] {
  const comparator = comparators[instruction.field]
  const sorted = [...items].sort(comparator)
  return instruction.direction === 'asc' ? sorted : sorted.reverse()
}
