'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '@/components/auth/auth-card.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailError('')

    if (!email.trim()) {
      setEmailError('This field cannot be empty')
      return
    }

    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      console.error('Forgot password fetch error:', error)
    } finally {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <main className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.brand}>Menowell</h1>
      </div>
      <div className={styles.card}>
        {sent ? (
          <div className={styles.successState}>
            <svg className={styles.successIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--sys-color-primary-primary,#690cb0)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <h2 className={styles.successHeading}>Check your email</h2>
            <p className={styles.successDesc}>
              If an account exists for this email address, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
            </p>
            <Link href="/auth" className={styles.submitBtn}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`${styles.form} ${styles.noLabelShift}`} noValidate>
            <h2 className={styles.formHeading}>Reset your password</h2>
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
                onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              />
              {emailError && <p className={styles.fieldError}>{emailError}</p>}
            </div>

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
