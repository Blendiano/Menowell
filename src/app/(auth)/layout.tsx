import { AuthGuard } from '@/components/auth/auth-guard'
import { Sidebar } from '@/components/layout/sidebar'
import styles from './authenticated.module.css'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.content}>{children}</div>
      </div>
    </AuthGuard>
  )
}
