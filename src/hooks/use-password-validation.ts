'use client'

import { useState, useMemo } from 'react'

export type TPasswordRule = {
  key: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_RULES: TPasswordRule[] = [
  { key: 'uppercase', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'At least one number', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'At least one special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  { key: 'minlength', label: 'At least 8 characters', test: (p) => p.length >= 8 },
]

export function usePasswordValidation() {
  const [passwordValue, setPasswordValue] = useState('')

  const activeRequirement = useMemo(() => {
    if (!passwordValue) return null
    return PASSWORD_RULES.find(rule => !rule.test(passwordValue)) ?? null
  }, [passwordValue])

  const validatePassword = (password: string): string | null => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(password)) return rule.label
    }
    return null
  }

  return {
    passwordValue,
    setPasswordValue,
    activeRequirement,
    validatePassword,
  }
}
