import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { AIInsight } from '@prisma/client'
import styles from './insights.module.css'

export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  if (!session?.user?.id) redirect('/auth/login')

  const insights = await prisma.aIInsight.findMany({
    where: { userId: session.user.id! },
    orderBy: { generatedAt: 'desc' },
    take: 20,
  })

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Your Insights</h1>
      <p className={styles.disclaimer}>This information is educational and not medical advice.</p>

      {insights.length === 0 ? (
        <div className={styles.empty}>
          <p>Log your symptoms regularly to start receiving personalized wellness insights.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {insights.map((insight: AIInsight) => (
            <li key={insight.id} className={styles.insightCard}>
              <p className={styles.insightText}>{insight.insightText}</p>
              <span className={styles.date}>{new Date(insight.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
