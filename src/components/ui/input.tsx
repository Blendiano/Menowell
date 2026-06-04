'use client'

import { forwardRef } from 'react'
import styles from './input.module.css'

type TInputProps = {
  label: string
  error?: string
  helperText?: string
  id: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, TInputProps>(
  ({ label, error, helperText, id, className, ...props }, ref) => {
    return (
      <div className={`${styles.root} ${className ?? ''}`}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        <input
          id={id}
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className={styles.helper}>{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
