import { useId } from 'react'
import type { FC, KeyboardEvent, ReactNode } from 'react'
import styles from './Toggle.module.css'

/**
 * Public props for the {@link Toggle} component.
 *
 * The component is a controlled, presentation-only binary switch: it holds
 * no internal state and has no knowledge of what "checked" represents for
 * the caller (dark mode, a filter flag, a settings switch, etc). State is
 * owned entirely by the parent and pushed down via `checked`; state changes
 * are requested via `onChange`, never applied internally.
 */
export interface ToggleProps {
  /** Current state of the switch. */
  checked: boolean
  /** Called with the requested next state when the user activates the switch via pointer or keyboard. */
  onChange: (checked: boolean) => void
  /** Optional graphic rendered inside the sliding thumb (e.g. a sun/moon icon). */
  icon?: ReactNode
  /** Disables pointer and keyboard interaction. */
  disabled?: boolean
  /** Accessible name for assistive technology. Required unless `aria-labelledby` is supplied instead. */
  'aria-label'?: string
  /** Id of an external element that labels this switch, as an alternative to `aria-label`. */
  'aria-labelledby'?: string
  /** Optional id override for the root element; a unique id is generated internally via `useId` when omitted. */
  id?: string
  /** Optional class name merged onto the root button element, for layout purposes only. */
  className?: string
}

/** Keys that must toggle the switch, per the WAI-ARIA `switch` pattern. */
const ACTIVATION_KEYS: ReadonlySet<string> = new Set(['Enter', ' ', 'Spacebar'])

/**
 * Toggle - an agnostic, fully accessible binary switch.
 *
 * Renders a native `button` carrying `role="switch"` and a dynamic
 * `aria-checked`, so screen readers announce it as a switch rather than a
 * generic button. Supports pointer clicks and keyboard activation via
 * Space/Enter. Carries zero business logic: it is purely a controlled
 * input/output pair (`checked` in, `onChange` out).
 */
export const Toggle: FC<ToggleProps> = ({
  checked,
  onChange,
  icon,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) => {
  const generatedId = useId()
  const toggleId = id ?? generatedId

  const requestToggle = (): void => {
    if (disabled) return
    onChange(!checked)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (!ACTIVATION_KEYS.has(event.key)) return
    // Prevent the browser's own Space/Enter-triggered click so the switch
    // toggles exactly once instead of twice (once here, once natively).
    event.preventDefault()
    requestToggle()
  }

  const rootClassName = [styles.toggle, checked ? styles.checked : null, className ?? null]
    .filter((value): value is string => Boolean(value))
    .join(' ')

  return (
    <button
      type="button"
      id={toggleId}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      disabled={disabled}
      className={rootClassName}
      onClick={requestToggle}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.thumb}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
      </span>
    </button>
  )
}
