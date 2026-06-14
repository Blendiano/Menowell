import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { getStage } from '@/services/user-service'
import Link from 'next/link'
import styles from './profile.module.css'

export const dynamic = 'force-dynamic'

const STAGE_LABELS: Record<string, string> = {
  premenopausal: 'Premenopausal',
  perimenopausal_early: 'Early Perimenopause',
  perimenopausal_late: 'Late Perimenopause',
  menopausal: 'Menopause',
  postmenopausal: 'Postmenopause',
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  const stage = await getStage(user.id)

  return (
    <main className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Profile</h1>
        <Link href="/profile/edit" className={styles.editBtn}>Edit profile</Link>
      </div>

      <section className={styles.card}>
        <div className={styles.avatarWrap}>
          {user?.image ? (
            <img src={user.image} alt={user.name ?? 'Profile'} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback} aria-label="Profile initials">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h2 className={styles.name}>{user?.name ?? 'No name set'}</h2>
          <p className={styles.email}>{user?.email}</p>
        </div>
      </section>

      {stage && (
        <section className={styles.stageSection}>
          <h2 className={styles.sectionTitle}>Menopause Stage</h2>
          <p className={styles.stageName}>{STAGE_LABELS[stage.stageName] ?? stage.stageName}</p>
          <p className={styles.stageConfidence}>Confidence: {Math.round(Number(stage.confidenceScore) * 100)}%</p>
        </section>
      )}

      <section className={styles.dangerZone}>
        <h2 className={styles.dangerTitle}>Account</h2>
        <form action={async () => {
          'use server'
          await signOut({ redirectTo: '/' })
        }}>
          <button type="submit" className={styles.signOutBtn}>Sign out</button>
        </form>
      </section>
    </main>
  )
}
