import { useCallback, useEffect, useState } from 'react'

/**
 * The three theme modes the application supports.
 *
 * `'light'` and `'dark'` are explicit user overrides; `'system'` defers to
 * the operating system's `prefers-color-scheme` preference. Live
 * synchronization for `'system'` is handled entirely by CSS (see
 * {@link applyThemeToDocument}) — there is deliberately no JS-side
 * `matchMedia` listener in this hook.
 */
export type Theme = 'light' | 'dark' | 'system'

/** `localStorage` key the theme preference is persisted under. */
const STORAGE_KEY = 'theme'

/** Fallback used whenever storage is empty, unreadable, or holds a corrupted value. */
const DEFAULT_THEME: Theme = 'system'

/** Class applied to `<html>` for an explicit `'light'` choice. */
const LIGHT_CLASS = 'theme-light'

/** Class applied to `<html>` for an explicit `'dark'` choice. */
const DARK_CLASS = 'theme-dark'

/**
 * Type guard narrowing an unknown value down to a valid {@link Theme}.
 *
 * @param value - Candidate value, typically read back from `localStorage`.
 * @returns `true` only if `value` is exactly `'light'`, `'dark'` or `'system'`.
 */
function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * Reads the persisted theme preference from `localStorage`.
 *
 * The read is wrapped in a try/catch because `localStorage` access can
 * throw (private browsing, disabled site data, exhausted quota). Any
 * failure, along with a missing or corrupted/unrecognized stored value, is
 * treated identically and resolves to {@link DEFAULT_THEME} — bad or
 * blocked storage can never crash the app or pin it to an invalid theme.
 *
 * @returns The stored theme if valid, otherwise {@link DEFAULT_THEME}.
 */
function readStoredTheme(): Theme {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return isTheme(raw) ? raw : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/**
 * Persists the theme preference to `localStorage`.
 *
 * Wrapped in a try/catch so a blocked or full storage never crashes the
 * app; persistence is best-effort, and in-memory React state remains the
 * source of truth for the current render regardless of write success.
 *
 * @param theme - The theme to persist.
 */
function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (privacy mode, quota, disabled by policy) — the
    // app keeps working from in-memory state; persistence is best-effort.
  }
}

/**
 * Synchronizes `document.documentElement` with an explicit theme choice.
 *
 * Mirrors the inline bootstrap script in `index.html` exactly (same two
 * classes, same branching), so this effect can only ever *confirm* the
 * class the bootstrap script already set before React mounted — never
 * contradict it:
 * - `'light'` / `'dark'`: both classes are stripped first, then the
 *   matching one is added, so `<html>` never carries a stale class from a
 *   previous choice.
 * - `'system'`: intentionally left class-less. `tokens.css`'s base
 *   `:root { color-scheme: light dark; }` already resolves every
 *   `light-dark()` call against the OS preference, live, with zero JS —
 *   adding a computed class here would only duplicate that resolution
 *   while erasing the distinction between "user chose dark" and "user
 *   chose system, OS happens to be dark". See the bootstrap script's own
 *   comment for the full rationale; this hook deliberately does not
 *   re-derive it with a `matchMedia` listener.
 *
 * @param theme - The active theme to render.
 */
function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement
  root.classList.remove(LIGHT_CLASS, DARK_CLASS)

  if (theme === 'light') {
    root.classList.add(LIGHT_CLASS)
  } else if (theme === 'dark') {
    root.classList.add(DARK_CLASS)
  }
}

/** Return shape of {@link useTheme}. */
export interface UseThemeResult {
  /** The currently selected theme mode. */
  theme: Theme
  /** Updates the theme mode: persists it to `localStorage` and re-syncs the DOM. */
  setTheme: (theme: Theme) => void
}

/**
 * useTheme - React hook that owns the application's color theme.
 *
 * Responsibilities:
 * 1. Holds the current {@link Theme} in React state, seeded from
 *    `localStorage` via the exact same read/validate/fallback rules as the
 *    `index.html` bootstrap script, so the first React render can only
 *    ever agree with the DOM state that script already produced — there
 *    is no code path where they read different raw storage or apply
 *    different validation and land on different values.
 * 2. Persists every change to `localStorage` under the `'theme'` key.
 * 3. Keeps `document.documentElement`'s classList in sync with the
 *    current theme (see {@link applyThemeToDocument} for why `'system'`
 *    intentionally applies no class, and why no `matchMedia` listener is
 *    needed here: CSS already tracks the OS preference live on its own).
 *
 * Pure React + TypeScript: no external state-management or theming
 * library is used.
 *
 * @returns The current theme and its setter — see {@link UseThemeResult}.
 */
export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  const setTheme = useCallback((next: Theme): void => {
    setThemeState(next)
    persistTheme(next)
  }, [])

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  return { theme, setTheme }
}
