'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './auth-card.module.css'

type TLoginFormProps = {
  registered?: boolean
}

export function LoginForm({ registered }: TLoginFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(registered ?? false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [passwordValue, setPasswordValue] = useState('')

  const PASSWORD_RULES = [
    { key: 'uppercase', label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { key: 'number', label: 'At least one number', test: (p: string) => /[0-9]/.test(p) },
    { key: 'special', label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    { key: 'minlength', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  ]

  const activeRequirement = useMemo(() => {
    if (!passwordValue) return null
    return PASSWORD_RULES.find(rule => !rule.test(passwordValue)) ?? null
  }, [passwordValue])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const errors: Record<string, string> = {}
    if (!email?.trim()) errors.email = 'This field cannot be empty'
    if (!password?.trim()) errors.password = 'This field cannot be empty'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    setFieldErrors({})

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <>
      {error && <div className={styles.errorSnackbar} role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form} noValidate style={{marginTop:16}}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Enter email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={styles.input} placeholder="you@example.com" onChange={() => clearFieldError('email')} onFocus={() => setError(null)} />
        {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>Enter password</label>
        <div className={styles.passwordWrapper}>
          <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={8} className={styles.input} placeholder="••••••••" onChange={e => { setPasswordValue(e.target.value); clearFieldError('password'); }} onFocus={() => setError(null)} />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(prev => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
        <Link href="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
        {activeRequirement && <p className={styles.passwordRequirement}>{activeRequirement.label}</p>}
        {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
      </div>

      {success && <p className={styles.successMsg}>Account created successfully! Please sign in.</p>}

      <button type="submit" className={styles.submitBtn} disabled={loading} aria-busy={loading}>
        {loading ? <><span className={styles.spinner} /> Signing in…</> : 'Sign in'}
      </button>

      <Link href="/" className={styles.backLink}>← Back to home</Link>

      <p className={styles.switchPrompt}>
        Don&apos;t have an account?{' '}
        <Link href="/auth?mode=register" className={styles.switchLink}>Create one</Link>
      </p>
    </form>
    </>
  )
}
