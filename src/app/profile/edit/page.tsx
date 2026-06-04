import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditProfileForm } from './edit-profile-form'
import styles from './edit-profile.module.css'

export default async function EditProfilePage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: {
      name: true,
      email: true,
      dateOfBirth: true,
      preferredLanguage: true,
      notificationPreference: true,
    },
  })

  if (!user) redirect('/profile')

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Edit Profile</h1>
      <p className={styles.subtitle}>Update your personal information and preferences.</p>
      <EditProfileForm user={user} />
    </main>
  )
}
