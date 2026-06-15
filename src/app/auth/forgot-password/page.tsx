'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '@/components/auth/auth-card.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setSent(true)
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
        <h2 className={styles.formHeading}>Reset your password</h2>

        {sent ? (
          <>
            <p className={styles.subtitle}>
              If an account with that email exists, we&apos;ve sent a reset link. Check your inbox.
            </p>
            <Link href="/auth" className={styles.submitBtn} style={{textAlign:'center',textDecoration:'none'}}>
              Back to sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Enter your email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && <p className={styles.errorMsg} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading} aria-busy={loading}>
              {loading ? <><span className={styles.spinner} /> Sending…</> : 'Send reset link'}
            </button>

            <Link href="/auth" className={styles.backLink}>← Back to sign in</Link>
          </form>
        )}
      </div>
    </main>
  )
}
