import styles from './card.module.css'

type TCardProps = {
  variant?: 'default' | 'outlined' | 'flat'
  padding?: 'sm' | 'md' | 'lg'
  as?: 'div' | 'article' | 'section'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({
  variant = 'default',
  padding = 'md',
  as: Component = 'div',
  children,
  className,
  onClick,
}: TCardProps) {
  return (
    <Component
      className={`${styles.root} ${styles[variant]} ${styles['pad-' + padding]} ${onClick ? styles.clickable : ''} ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {children}
    </Component>
  )
}
