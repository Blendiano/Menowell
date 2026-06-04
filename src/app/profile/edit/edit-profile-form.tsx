'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/features/profile/actions'
import { Button } from '@/components/ui/button'
import styles from './edit-profile.module.css'

type TUserData = {
  name: string | null
  email: string | null
  dateOfBirth: Date | null
  preferredLanguage: string
  notificationPreference: boolean
}

export function EditProfileForm({ user }: { user: TUserData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    const form = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await updateProfile({
        name: form.get('name') as string,
        dateOfBirth: form.get('dateOfBirth') as string,
        preferredLanguage: form.get('preferredLanguage') as string,
        notificationPreference: form.get('notificationPreference') === 'on',
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.refresh()
      }
    })
  }

  const dobValue = user.dateOfBirth
    ? new Date(user.dateOfBirth).toISOString().split('T')[0]
    : ''

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Full name</label>
        <input id="name" name="name" type="text" className={styles.input} defaultValue={user.name ?? ''} />
      </div>

      <div className={styles.field}>
        <label htmlFor="dateOfBirth" className={styles.label}>Date of birth</label>
        <input id="dateOfBirth" name="dateOfBirth" type="date" className={styles.input} defaultValue={dobValue} />
        <span className={styles.hint}>Used to estimate your menopause stage.</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="preferredLanguage" className={styles.label}>Preferred language</label>
        <select id="preferredLanguage" name="preferredLanguage" className={styles.select} defaultValue={user.preferredLanguage}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="pt">Portuguese</option>
        </select>
      </div>

      <label className={styles.checkbox}>
        <input type="checkbox" name="notificationPreference" defaultChecked={user.notificationPreference} />
        <span>Receive notifications about community activity</span>
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {success && <p className={styles.success}>Profile updated successfully.</p>}

      <div className={styles.actions}>
        <Button variant="ghost" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
