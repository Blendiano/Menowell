'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import styles from '@/components/auth/auth-card.module.css'

const PASSWORD_RULES = [
  { key: 'uppercase', label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: 'At least one number', test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { key: 'minlength', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
]

type TResetPageProps = {
  params: Promise<{ token: string }>
}

export default function ResetPasswordPage({ params }: TResetPageProps) {
  const { token } = use(params)
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const activeRequirement = useMemo(() => {
    if (!password) return null
    return PASSWORD_RULES.find(rule => !rule.test(password)) ?? null
  }, [password])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.brand}>Menowell</h1>
      </div>
      <div className={styles.card}>
        <h2 className={styles.formHeading}>Set new password</h2>

        {success ? (
          <>
            <p className={styles.subtitle}>Your password has been reset successfully.</p>
            <Link href="/auth" className={styles.submitBtn} style={{textAlign:'center',textDecoration:'none'}}>
              Sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>New password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(prev => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {activeRequirement && <p className={styles.passwordRequirement}>{activeRequirement.label}</p>}
            </div>

            {error && <p className={styles.errorMsg} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading} aria-busy={loading}>
              {loading ? <><span className={styles.spinner} /> Resetting…</> : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
