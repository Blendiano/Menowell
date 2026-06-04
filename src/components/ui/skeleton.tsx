import styles from './skeleton.module.css'

type TSkeletonProps = {
  variant?: 'text' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ variant = 'text', width, height, className }: TSkeletonProps) {
  return (
    <div
      className={`${styles.root} ${styles[variant]} ${className ?? ''}`}
      style={{ width, height }}
      aria-hidden
    />
  )
}

export function CardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton variant="rect" height="20px" width="60%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant="rect" height="60px" />
      ))}
    </div>
  )
}
