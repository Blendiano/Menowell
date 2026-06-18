'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import styles from './sidebar.module.css'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/symptoms', label: 'Symptoms', icon: '📋' },
  { href: '/dashboard/insights', label: 'Insights', icon: '✨' },
  { href: '/dashboard/learn', label: 'Learn', icon: '📚' },
  { href: '/dashboard/community', label: 'Community', icon: '💬' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className={styles.root} aria-label="Main navigation">
      <div className={styles.brand}>Menowell</div>
      <ul className={styles.list}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard')
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
