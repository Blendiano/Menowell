'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Global error boundary caught:', error)
  return (
    <main style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: '24px', textAlign: 'center', gap: '16px',
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f273e' }}>
        Something went wrong
      </h1>
      <p style={{ color: '#334e68', maxWidth: '400px' }}>
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </main>
  )
}
