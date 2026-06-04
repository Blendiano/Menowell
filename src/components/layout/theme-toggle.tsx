'use client'

import { useTheme } from '@/components/providers/theme-provider'
import styles from './theme-toggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={styles.root}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      type="button"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
