'use client'

import styles from './button.module.css'

type TButtonProps = {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  type = 'button',
  children,
  className,
  onClick,
}: TButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.root} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className ?? ''}`}
      disabled={disabled ?? loading}
      aria-busy={loading}
      onClick={onClick}
    >
      {loading && <span className={styles.spinner} aria-hidden />}
      <span className={loading ? styles.loadingText : ''}>{children}</span>
    </button>
  )
}
