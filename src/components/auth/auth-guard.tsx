'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './auth-guard.module.css'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session) {
      router.replace('/auth')
      return
    }

    async function validate() {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) throw new Error('Invalid session')
        setReady(true)
      } catch (error) {
        console.error('AuthGuard validation error:', error)
        await signOut({ redirect: false })
        router.replace('/auth')
      }
    }

    validate()
  }, [session, status, router])

  if (status === 'loading' || !ready) {
    return (
      <div className={styles.root}>
        <div className={styles.spinner} aria-label="Loading" />
      </div>
    )
  }

  return <>{children}</>
}
