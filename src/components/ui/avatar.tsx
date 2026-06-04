import styles from './avatar.module.css'

type TAvatarProps = {
  src?: string | null
  alt: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, alt, fallback, size = 'md', className }: TAvatarProps) {
  return (
    <div className={`${styles.root} ${styles[size]} ${className ?? ''}`}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <div className={styles.fallback} aria-label={alt}>
          {fallback ?? alt?.charAt(0).toUpperCase() ?? '?'}
        </div>
      )}
    </div>
  )
}
