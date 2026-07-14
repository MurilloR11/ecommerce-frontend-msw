import { useRef } from 'react'
import type { KeyboardEvent, ReactElement, ReactNode } from 'react'
import styles from './SegmentedControl.module.css'

/** A single selectable option rendered inside a {@link SegmentedControl}. */
export interface SegmentedControlOption<TValue extends string> {
  /** The value this option represents; must be unique within the group. */
  value: TValue
  /** Visible text for the option. */
  label: string
  /** Optional graphic rendered before the label. */
  icon?: ReactNode
}

/**
 * Public props for {@link SegmentedControl}.
 *
 * The component is a controlled, presentation-only "choose exactly one of
 * N mutually exclusive options" control. It holds no internal selection
 * state and has no knowledge of what the options represent (a theme, a
 * filter, a view mode, etc). The caller owns `value` and reacts to
 * `onChange`; the component never applies a selection internally.
 */
export interface SegmentedControlProps<TValue extends string> {
  /** The set of mutually exclusive options, in display order. */
  options: readonly SegmentedControlOption<TValue>[]
  /** The currently selected value. */
  value: TValue
  /** Called with the newly selected value when the user picks a different option. */
  onChange: (value: TValue) => void
  /** Accessible name for the group, read by assistive technology (e.g. "Theme"). */
  'aria-label': string
  /** Disables pointer and keyboard interaction for every option. */
  disabled?: boolean
  /** Optional id override for the root element. */
  id?: string
  /** Optional class name merged onto the root element, for layout purposes only. */
  className?: string
}

/**
 * SegmentedControl - an agnostic, accessible "pick one of N" control.
 *
 * Implements the WAI-ARIA `radiogroup` pattern rather than `tablist`:
 * selecting an option here changes a persisted, mutually-exclusive setting
 * (like a native radio group), it does not swap a visible content panel in
 * the same region (which is what `tablist`/`tabpanel` models). The root
 * carries `role="radiogroup"`; each option carries `role="radio"` and a
 * dynamic `aria-checked`.
 *
 * Keyboard model matches native radio groups: the group is a single Tab
 * stop (roving `tabIndex`, resting on the selected option), and
 * Left/Right/Up/Down/Home/End both move focus AND select immediately —
 * there is no separate "focus without selecting" state, exactly like
 * native `<input type="radio">` siblings.
 *
 * Generic over the option's value type (constrained to `string`) rather
 * than typed as `React.FC` — `FC` cannot express a type parameter, and a
 * plain generic function component is the standard way to keep `value`/
 * `onChange`/`options` in exact sync for whatever literal union the caller
 * passes in (e.g. `'light' | 'dark' | 'system'`).
 */
export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<TValue>): ReactElement {
  const optionRefs = useRef<Map<TValue, HTMLButtonElement>>(new Map())

  const registerOptionRef = (optionValue: TValue) => (node: HTMLButtonElement | null): void => {
    if (node) {
      optionRefs.current.set(optionValue, node)
    } else {
      optionRefs.current.delete(optionValue)
    }
  }

  const selectOption = (optionValue: TValue): void => {
    if (disabled || optionValue === value) return
    onChange(optionValue)
  }

  const focusOption = (optionValue: TValue): void => {
    optionRefs.current.get(optionValue)?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const lastIndex = options.length - 1
    let nextIndex: number

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = index === lastIndex ? 0 : index + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = index === 0 ? lastIndex : index - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    const nextOption = options[nextIndex]
    if (!nextOption) return
    focusOption(nextOption.value)
    selectOption(nextOption.value)
  }

  const rootClassName = [styles.group, className ?? null]
    .filter((cls): cls is string => Boolean(cls))
    .join(' ')

  return (
    <div role="radiogroup" aria-label={ariaLabel} id={id} className={rootClassName}>
      {options.map((option, index) => {
        const isSelected = option.value === value
        const optionClassName = [styles.option, isSelected ? styles.selected : null]
          .filter((cls): cls is string => Boolean(cls))
          .join(' ')

        return (
          <button
            key={option.value}
            ref={registerOptionRef(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={disabled}
            className={optionClassName}
            onClick={() => {
              selectOption(option.value)
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index)
            }}
          >
            {option.icon ? <span className={styles.icon}>{option.icon}</span> : null}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
