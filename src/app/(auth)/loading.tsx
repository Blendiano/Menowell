import { Sidebar } from '@/components/layout/sidebar'
import { CardSkeleton } from '@/components/ui/skeleton'
import styles from './authenticated.module.css'

export default function AuthLoading() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ height: '32px', width: '250px', background: '#deebf7', borderRadius: '8px', marginBottom: '8px' }} aria-hidden />
            <div style={{ height: '16px', width: '200px', background: '#deebf7', borderRadius: '8px' }} aria-hidden />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
