import { CardSkeleton } from '@/components/ui/skeleton'
import styles from './dashboard.module.css'

export default function DashboardLoading() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div style={{ height: '32px', width: '250px', background: '#deebf7', borderRadius: '8px', marginBottom: '8px' }} aria-hidden />
        <div style={{ height: '16px', width: '200px', background: '#deebf7', borderRadius: '8px' }} aria-hidden />
      </div>
      <div className={styles.grid}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
