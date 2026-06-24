import styles from './onboarding.module.css'

export function Celebration({ message }: { message?: string }) {
  return (
    <div className={styles.overlay}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className={styles.confetti}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -20}%`,
            background: ['#690cb0', '#edd9fc', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4897'][i % 7],
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDuration: `${2 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      {message && <p className={styles.successMessage}>{message}</p>}
      <div className={styles.celebrationEmoji}>🎉</div>
    </div>
  )
}
