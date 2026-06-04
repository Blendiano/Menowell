'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
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
    <main className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.brand}>Menowell</h1>
          <p className={styles.subtitle}>Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Link href="/auth/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className={styles.errorMsg} role="alert">{error}</p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.registerPrompt}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className={styles.registerLink}>
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
