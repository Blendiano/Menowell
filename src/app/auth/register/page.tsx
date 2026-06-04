'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './register.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.')
      } else {
        router.push('/auth/login?registered=1')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.brand}>Menowell</h1>
          <p className={styles.subtitle}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full name</label>
            <input id="name" name="name" type="text" autoComplete="name" required className={styles.input} placeholder="Jane Smith" />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required className={styles.input} placeholder="you@example.com" />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password <span className={styles.hint}>(min. 8 characters)</span></label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={styles.input} placeholder="••••••••" />
          </div>

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading} aria-busy={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          Already have an account?{' '}
          <Link href="/auth/login" className={styles.loginLink}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
