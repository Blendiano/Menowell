import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSymptomHistory } from '@/features/symptoms/actions'
import { SYMPTOM_LABELS } from '@/lib/constants'
import Link from 'next/link'
import styles from './symptoms.module.css'

export const dynamic = 'force-dynamic'

export default async function SymptomsPage() {
  const session = await auth()
  if (!session) redirect('/auth')

  const logs = await getSymptomHistory()

  return (
    <main className={styles.root}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Symptom Tracker</h1>
        <Link href="/dashboard/symptoms/new" className={styles.logBtn}>+ Log symptom</Link>
        <p className={styles.supportText}>Log symptoms. Track trends. Understand your health.</p>
      </div>

      {logs.length === 0 ? null : (
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
