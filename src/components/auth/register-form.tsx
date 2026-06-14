'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import styles from './auth-card.module.css'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  function handleNameChange(value: string) {
    if (value.trim().length > 0 && value.trim().length < 2) {
      setFieldErrors(prev => ({ ...prev, name: 'Full name must be at least 2 characters' }))
    } else {
      clearFieldError('name')
    }
  }

  function handleEmailChange(value: string) {
    if (value.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email address' }))
    } else {
      clearFieldError('email')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const name = form.get('name') as string
    const email = form.get('email') as string
    const password = form.get('password') as string

    const errors: Record<string, string> = {}
    if (!name?.trim()) errors.name = 'This field cannot be empty'
    if (!email?.trim()) errors.email = 'This field cannot be empty'
    if (!password?.trim()) errors.password = 'This field cannot be empty'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    setFieldErrors({})

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.')
      } else {
        const result = await signIn('credentials', { email, password, redirect: false })
        if (result?.error) {
          router.push('/auth')
        } else {
          router.push('/onboarding')
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Enter full name</label>
        <input id="name" name="name" type="text" autoComplete="name" required className={styles.input} placeholder="Jane Smith" autoFocus onChange={e => handleNameChange(e.target.value)} onBlur={e => { if (!e.target.value.trim()) setFieldErrors(prev => ({ ...prev, name: 'This field cannot be empty' })); }} />
        {fieldErrors.name && <p className={styles.fieldError}>{fieldErrors.name}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Enter email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={styles.input} placeholder="you@example.com" onChange={e => handleEmailChange(e.target.value)} onBlur={e => { if (!e.target.value.trim()) setFieldErrors(prev => ({ ...prev, email: 'This field cannot be empty' })); }} />
        {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>Enter password <span className={styles.hint}>(min. 8 characters)</span></label>
        <div className={styles.passwordWrapper}>
          <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} className={styles.input} placeholder="••••••••" onChange={() => clearFieldError('password')} />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(prev => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
        {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
        <Link href="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <button type="submit" className={styles.submitBtn} disabled={loading} aria-busy={loading}>
        {loading ? <><span className={styles.spinner} /> Creating account…</> : 'Create account'} <span style={{fontSize:20}}>→</span>
      </button>

      <p className={styles.switchPrompt}>
        Already have an account?{' '}
        <Link href="/auth" className={styles.switchLink}>Sign in</Link>
      </p>
    </form>
  )
}
