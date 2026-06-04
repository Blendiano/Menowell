import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRecentSymptomSummary } from '@/services/symptom-service'
import { getStage } from '@/services/user-service'
import { getLatestInsight } from '@/services/insight-service'
import styles from './dashboard.module.css'

export const dynamic = 'force-dynamic'

const SYMPTOM_LABELS: Record<string, string> = {
  hot_flash: 'Hot Flash', night_sweat: 'Night Sweat', fatigue: 'Fatigue',
  insomnia: 'Insomnia', anxiety: 'Anxiety', mood_swing: 'Mood Swing',
  brain_fog: 'Brain Fog', joint_pain: 'Joint Pain', headache: 'Headache', other: 'Other',
}

const STAGE_LABELS: Record<string, string> = {
  premenopausal: 'Premenopausal',
  perimenopausal_early: 'Early Perimenopause',
  perimenopausal_late: 'Late Perimenopause',
  menopausal: 'Menopause',
  postmenopausal: 'Postmenopause',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const userId = session.user!.id!

  const [symptomSummary, stage, latestInsight] = await Promise.all([
    getRecentSymptomSummary(userId),
    getStage(userId),
    getLatestInsight(userId),
  ])

  const firstName = session.user?.name?.split(' ')[0] ?? 'there'

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.greeting}>Hello, {firstName} 👋</h1>
        <p className={styles.subGreeting}>Here&apos;s your wellness overview for today.</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card} aria-label="Symptom tracker">
          <h2 className={styles.cardTitle}>Today&apos;s Symptoms</h2>
          {symptomSummary.total > 0 ? (
            <>
              <p className={styles.cardBody}>
                <strong>{symptomSummary.total} symptoms</strong> logged this week.
                {symptomSummary.mostCommon && (
                  <> Most common: {SYMPTOM_LABELS[symptomSummary.mostCommon] ?? symptomSummary.mostCommon}.</>
                )}
                {symptomSummary.averageSeverity > 0 && (
                  <> Average severity: {symptomSummary.averageSeverity}/10.</>
                )}
              </p>
              <Link href="/symptoms" className={styles.cardAction}>View all logs</Link>
            </>
          ) : (
            <>
              <p className={styles.cardBody}>You haven&apos;t logged any symptoms yet today.</p>
              <Link href="/symptoms/new" className={styles.cardAction}>Log a symptom</Link>
            </>
          )}
        </section>

        <section className={styles.card} aria-label="Menopause stage">
          <h2 className={styles.cardTitle}>Your Stage</h2>
          {stage ? (
            <>
              <p className={styles.cardBody}>
                <strong>{STAGE_LABELS[stage.stageName] ?? stage.stageName}</strong>
                <br />
                Confidence: {Math.round(Number(stage.confidenceScore) * 100)}%
              </p>
              <Link href="/profile" className={styles.cardAction}>View details</Link>
            </>
          ) : (
            <>
              <p className={styles.cardBody}>Complete your profile to identify your menopause stage.</p>
              <Link href="/profile/edit" className={styles.cardAction}>Update profile</Link>
            </>
          )}
        </section>

        <section className={styles.card} aria-label="Latest insight">
          <h2 className={styles.cardTitle}>Latest Insight</h2>
          {latestInsight ? (
            <>
              <p className={styles.cardBody}>{latestInsight.insightText}</p>
              <Link href="/insights" className={styles.cardAction}>View all insights</Link>
            </>
          ) : (
            <>
              <p className={styles.cardBody}>Insights will appear here once you&apos;ve logged your first symptoms.</p>
              <Link href="/insights" className={styles.cardAction}>View insights</Link>
            </>
          )}
        </section>

        <section className={styles.card} aria-label="Educational content">
          <h2 className={styles.cardTitle}>Learn</h2>
          <p className={styles.cardBody}>Explore articles and guides about menopause and wellness.</p>
          <Link href="/learn" className={styles.cardAction}>Browse library</Link>
        </section>
      </div>
    </main>
  )
}
