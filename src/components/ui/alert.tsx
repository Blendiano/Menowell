'use client'

import { useState } from 'react'
import styles from './alert.module.css'

type TAlertProps = {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  dismissible?: boolean
  className?: string
}

const VARIANT_MAP: Record<string, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
}

export function Alert({ variant = 'info', title, message, dismissible, className }: TAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className={`${styles.root} ${VARIANT_MAP[variant] ?? styles.info} ${className ?? ''}`}
      role="alert"
    >
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.message}>{message}</p>
      </div>
      {dismissible && (
        <button
          className={styles.dismiss}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  )
}
