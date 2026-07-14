import type { FC } from 'react'
import { useTheme } from '@/shared/lib/theme'
import type { Theme } from '@/shared/lib/theme'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import type { SegmentedControlOption } from '@/shared/ui/SegmentedControl'

/**
 * The three theme options offered to the user, in display order.
 *
 * Declared once at module scope (not inside the component) so it is a
 * stable reference across renders and reads as the single source of truth
 * for "what can this control show" — adding a fourth theme later is a
 * one-line change here.
 */
const THEME_OPTIONS: readonly SegmentedControlOption<Theme>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

/**
 * ThemeToggle - feature component that lets the user pick the
 * application's color theme.
 *
 * Bridges the agnostic `SegmentedControl` UI primitive (from `shared/ui`)
 * with the `useTheme` state hook (from `shared/lib/theme`). The theme is a
 * three-way, mutually-exclusive choice (`'light' | 'dark' | 'system'`), so
 * it is rendered as a `radiogroup`-based segmented control rather than a
 * binary switch: a boolean cannot represent a third, distinct "follow the
 * OS" state without silently collapsing it into whichever of light/dark it
 * currently resolves to, which would make `'system'` unselectable again
 * once chosen.
 *
 * `value`/`onChange` are wired straight through to `useTheme` with no
 * intermediate resolution — the control always reflects and sets the
 * user's actual stored intent, not a derived boolean.
 */
export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={setTheme} aria-label="Theme" />
  )
}
