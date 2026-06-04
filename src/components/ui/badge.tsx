import styles from './badge.module.css'

type TBadgeProps = {
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const VARIANT_MAP: Record<string, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  error: styles.error,
  success: styles.success,
  warning: styles.warning,
  neutral: styles.neutral,
}

export function Badge({ variant = 'primary', size = 'md', children, className }: TBadgeProps) {
  return (
    <span className={`${styles.root} ${VARIANT_MAP[variant] ?? styles.primary} ${styles[size]} ${className ?? ''}`}>
      {children}
    </span>
  )
}
