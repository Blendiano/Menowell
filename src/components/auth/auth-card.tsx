import type { ReactNode } from 'react'
import Link from 'next/link'
import styles from './auth-card.module.css'

type TAuthCardProps = {
  heading: string
  subtitle?: string
  children: ReactNode
}

export function AuthCard({ heading, subtitle, children }: TAuthCardProps) {
  return (
    <main className={styles.root}>
      <div className={styles.header}>
        <Link href="/" className={styles.brand}>Menowell</Link>
      </div>
      <div className={styles.card}>
        <h2 className={styles.formHeading}>{heading}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </main>
  )
}
