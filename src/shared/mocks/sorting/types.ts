export interface SortInstruction<TField extends string> {
  field: TField
  direction: 'asc' | 'desc'
}

export type Comparator<TItem> = (a: TItem, b: TItem) => number
