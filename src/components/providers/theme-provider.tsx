'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type TTheme = 'light' | 'dark'

type TThemeContext = {
  theme: TTheme
  toggleTheme: () => void
  setTheme: (theme: TTheme) => void
}

const ThemeContext = createContext<TThemeContext | null>(null)

const STORAGE_KEY = 'menowell-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<TTheme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as TTheme | null
    const initial = stored ?? 'light'
    setThemeState(initial)
    document.documentElement.setAttribute('data-theme', initial)
    setMounted(true)
  }, [])

  const setTheme = useCallback((newTheme: TTheme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
