'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSymptomLog } from '@/features/symptoms/actions'
import styles from './new-symptom.module.css'

export const dynamic = 'force-dynamic'

const SYMPTOMS = [
  { value: 'hot_flash', label: 'Hot Flash' },
  { value: 'night_sweat', label: 'Night Sweat' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'insomnia', label: 'Insomnia' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'mood_swing', label: 'Mood Swing' },
  { value: 'brain_fog', label: 'Brain Fog' },
  { value: 'joint_pain', label: 'Joint Pain' },
  { value: 'headache', label: 'Headache' },
  { value: 'other', label: 'Other' },
] as const

type TSymptomName = (typeof SYMPTOMS)[number]['value']

export default function NewSymptomPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [severity, setSeverity] = useState(5)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await createSymptomLog({
        symptomName: form.get('symptomName') as TSymptomName,
        severity,
        notes: form.get('notes') as string,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/symptoms')
      }
    })
  }

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Log a Symptom</h1>
      <p className={styles.disclaimer}>This information is educational and not medical advice.</p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="symptomName" className={styles.label}>Symptom <span aria-hidden>*</span></label>
          <select id="symptomName" name="symptomName" required className={styles.select}>
            {SYMPTOMS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="severity" className={styles.label}>Severity: <strong>{severity}</strong>/10</label>
          <input
            id="severity"
            type="range"
            min={1} max={10} step={1}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className={styles.slider}
            aria-valuemin={1} aria-valuemax={10} aria-valuenow={severity}
          />
          <div className={styles.sliderLabels}><span>Mild</span><span>Severe</span></div>
        </div>

        <div className={styles.field}>
          <label htmlFor="notes" className={styles.label}>Notes <span className={styles.optional}>(optional)</span></label>
          <textarea id="notes" name="notes" rows={4} maxLength={500} className={styles.textarea} placeholder="Any additional context about how you're feeling…" />
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>Cancel</button>
          <button type="submit" className={styles.submitBtn} disabled={isPending} aria-busy={isPending}>
            {isPending ? 'Saving…' : 'Save symptom'}
          </button>
        </div>
      </form>
    </main>
  )
}
