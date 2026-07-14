import type { FC, PropsWithChildren } from 'react'
import { ThemeToggle } from '@/features/toggle-theme'
import styles from './Layout.module.css'

/**
 * Layout - the application-wide shell.
 *
 * Wraps every page with a persistent header so that app-level controls —
 * currently just the theme selector — are available everywhere, not only
 * on whichever single page happens to render them. This is the only place
 * `ThemeToggle` should be mounted; individual pages must not render their
 * own, ad-hoc theme control (that would create a second, independent piece
 * of state racing the real one over the same `<html>` classes).
 */
export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Ecommerce Admin</span>
        <ThemeToggle />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
