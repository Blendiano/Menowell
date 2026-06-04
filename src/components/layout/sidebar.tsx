'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ThemeToggle } from './theme-toggle'
import styles from './sidebar.module.css'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/symptoms', label: 'Symptoms', icon: '📋' },
  { href: '/insights', label: 'Insights', icon: '✨' },
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/community', label: 'Community', icon: '💬' },
  { href: '/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const unread = 0

  return (
    <nav className={styles.root} aria-label="Main navigation">
      <div className={styles.brand}>Menowell</div>
      <ul className={styles.list}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.icon} aria-hidden>{icon}</span>
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className={styles.bottom}>
        <ThemeToggle />
      </div>
    </nav>
  )
}
