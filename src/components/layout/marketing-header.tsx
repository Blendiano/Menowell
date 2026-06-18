'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TransitionLink } from '@/components/ui/transition-link'
import styles from './marketing-header.module.css'

export function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>Menowell</Link>

        <button
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={`${styles.bar} ${open ? styles.bar1 : ''}`} />
          <span className={`${styles.bar} ${open ? styles.bar2 : ''}`} />
          <span className={`${styles.bar} ${open ? styles.bar3 : ''}`} />
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.navInner}>
            <Link href="/" className={styles.navLink} onClick={() => setOpen(false)}>Home</Link>
            <Link href="#how-it-works" className={styles.navLink} onClick={() => setOpen(false)}>How It Works</Link>
            <div className={styles.mobileActions}>
              <TransitionLink href="/auth" className={styles.navOutline}>Log in</TransitionLink>
              <TransitionLink href="/auth?mode=register" className={styles.navCta}>Get Started</TransitionLink>
            </div>
          </div>
        </nav>

        <div className={styles.desktopLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="#how-it-works" className={styles.navLink}>How It Works</Link>
        </div>

        <div className={styles.desktopActions}>
          <TransitionLink href="/auth" className={styles.navOutline}>Log in</TransitionLink>
          <TransitionLink href="/auth?mode=register" className={styles.navCta}>Get Started</TransitionLink>
        </div>
      </div>
    </header>
  )
}
