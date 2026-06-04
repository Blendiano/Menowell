import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MarkAllReadButton } from './mark-all-read-button'
import type { Notification } from '@prisma/client'
import styles from './notifications.module.css'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: 'desc' },
    take: 50,
  }) as Notification[]

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length

  return (
    <main className={styles.root}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <p className={styles.unreadBadge}>{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <p>No notifications yet. You&apos;ll see updates here when the community engages with your posts.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`${styles.item} ${notification.status === 'UNREAD' ? styles.unread : ''}`}
            >
              <p className={styles.message}>{notification.message}</p>
              <span className={styles.date}>
                {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
