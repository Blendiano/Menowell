import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSymptomHistory } from '@/features/symptoms/actions'
import Link from 'next/link'
import styles from './symptoms.module.css'

const SYMPTOM_LABELS: Record<string, string> = {
  hot_flash: 'Hot Flash', night_sweat: 'Night Sweat', fatigue: 'Fatigue',
  insomnia: 'Insomnia', anxiety: 'Anxiety', mood_swing: 'Mood Swing',
  brain_fog: 'Brain Fog', joint_pain: 'Joint Pain', headache: 'Headache', other: 'Other',
}

export default async function SymptomsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const logs = await getSymptomHistory()

  return (
    <main className={styles.root}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Symptom Tracker</h1>
        <Link href="/symptoms/new" className={styles.logBtn}>+ Log symptom</Link>
      </div>

      {logs.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Track your first symptom to start understanding your patterns.</p>
          <Link href="/symptoms/new" className={styles.logBtn}>Log your first symptom</Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {logs.map((log) => (
            <li key={log.id} className={styles.logItem}>
              <div className={styles.logInfo}>
                <span className={styles.symptomName}>{SYMPTOM_LABELS[log.symptomName] ?? log.symptomName}</span>
                <span className={styles.logDate}>{new Date(log.loggedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className={styles.severityBar}>
                <div className={styles.severityFill} style={{ width: `${log.severity * 10}%` }} />
              </div>
              <span className={styles.severityLabel}>Severity {log.severity}/10</span>
              {log.notes && <p className={styles.notes}>{log.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
