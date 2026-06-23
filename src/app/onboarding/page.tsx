'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { saveOnboarding } from '@/features/onboarding/actions'
import { Celebration } from './celebration'
import styles from './onboarding.module.css'

const MENSTRUAL_OPTIONS = [
  { value: 'STILL_MENSTRUATING', label: 'I\'m still having periods' },
  { value: 'IRREGULAR', label: 'My periods have become irregular' },
  { value: 'NO_PERIOD_12M', label: 'I haven\'t had a period in 12+ months' },
  { value: 'NOT_SURE', label: 'I\'m not sure / just starting to learn' },
] as const

const SYMPTOM_OPTIONS = [
  'Hot flashes / night sweats', 'Mood changes / irritability', 'Sleep difficulties',
  'Weight changes', 'Low libido', 'Vaginal dryness', 'Brain fog / difficulty concentrating',
  'Fatigue', 'Joint pain', 'Anxiety', 'Headaches',
  'No symptoms currently',
] as const

const SEVERITY_OPTIONS = [
  { value: 'MILD', label: 'Mild — Manageable most days' },
  { value: 'MODERATE', label: 'Moderate — Often affects daily activities' },
  { value: 'SEVERE', label: 'Severe — Frequently impacts quality of life' },
] as const

const GOAL_OPTIONS = [
  'Track symptoms', 'Understand my body better', 'Find community support',
  'Get personalized insights', 'Learn about menopause', 'Improve sleep',
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [dateOfBirth, setDateOfBirth] = useState('')
  const [menstrualStatus, setMenstrualStatus] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [symptomSeverity, setSymptomSeverity] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleSymptom(symptom: string) {
    if (symptom === 'No symptoms currently') {
      setSelectedSymptoms(prev => prev.includes(symptom) ? [] : ['No symptoms currently'])
    } else {
      setSelectedSymptoms(prev =>
        prev.includes(symptom)
          ? prev.filter(s => s !== symptom)
          : [...prev.filter(s => s !== 'No symptoms currently'), symptom]
      )
    }
    setFieldErrors(prev => ({ ...prev, symptoms: '' }))
  }

  function toggleGoal(goal: string) {
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )
    setFieldErrors(prev => ({ ...prev, goals: '' }))
  }

  function clearFieldError(field: string) {
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return dateOfBirth.trim().length > 0 && menstrualStatus !== ''
      case 1: return selectedSymptoms.length > 0
      case 2: return symptomSeverity !== '' && goals.length > 0
      default: return true
    }
  }

  async function handleNext() {
    setFieldErrors({})

    if (step === 0) {
      const errors: Record<string, string> = {}
      if (!dateOfBirth.trim()) errors.dob = 'This field must not be empty'
      if (!menstrualStatus) errors.menstrual = 'This field must not be empty'
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }
    }

    if (step === 1) {
      if (selectedSymptoms.length === 0) {
        setFieldErrors({ symptoms: 'This field must not be empty' })
        return
      }
    }

    if (step === 2) {
      const errors: Record<string, string> = {}
      if (!symptomSeverity) errors.severity = 'This field must not be empty'
      if (goals.length === 0) errors.goals = 'This field must not be empty'
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let imageUrl: string | undefined
      if (profileImage) {
        const formData = new FormData()
        formData.append('file', profileImage)
        const uploadRes = await fetch('/api/upload/avatar', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (uploadData.error) {
          setError(uploadData.error)
          setLoading(false)
          return
        }
        imageUrl = uploadData.data.url
      }

      const result = await saveOnboarding({
        dateOfBirth,
        menstrualStatus,
        selectedSymptoms,
        symptomSeverity,
        goals,
        profileImage: imageUrl,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setShowCelebration(true)
      await new Promise(r => setTimeout(r, 2000))
      setShowCelebration(false)
      setLoading(false)
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const totalSteps = 4

  return (
    <main className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.brand}>Menowell</h1>
      </div>
      <div className={styles.card}>
        <div className={styles.steps}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={styles.stepItem}>
              <div
                className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''} ${i < step ? styles.stepDotDone : ''}`}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && <span className={styles.stepArrow}>→</span>}
            </div>
          ))}
        </div>

        {step === 0 && (
          <section>
            <h2 className={styles.stepHeading}>About you</h2>
            <p className={styles.stepDesc}>Help us understand where you are in your journey.</p>
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="dob" className={styles.label}>Date of birth</label>
                <p className={styles.fieldDesc}>Used to personalize your menopause insights.</p>
                <input id="dob" type="text" inputMode="numeric" placeholder="dd/mm/yyyy" value={dateOfBirth} onChange={e => { setDateOfBirth(e.target.value); clearFieldError('dob'); }} className={styles.input} required autoFocus />
                {fieldErrors.dob && <p className={styles.errorMsg}>{fieldErrors.dob}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Which best describes your current stage?</label>
                <div className={styles.radioGroup}>
                  {MENSTRUAL_OPTIONS.map(opt => (
                    <label key={opt.value} className={`${styles.radioLabel} ${menstrualStatus === opt.value ? styles.radioLabelSelected : ''}`}>
                      <input type="radio" name="menstrualStatus" value={opt.value} checked={menstrualStatus === opt.value} onChange={e => { setMenstrualStatus(e.target.value); clearFieldError('menstrual'); }} className={styles.radioInput} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {fieldErrors.menstrual && <p className={styles.errorMsg}>{fieldErrors.menstrual}</p>}
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className={styles.stepHeading}>Your symptoms</h2>
            <p className={styles.stepDesc}>Select all symptoms you&apos;re currently experiencing.</p>
            <div className={styles.checkboxGroup}>
              {SYMPTOM_OPTIONS.map(symptom => (
                <label key={symptom} className={`${styles.checkboxLabel} ${selectedSymptoms.includes(symptom) ? styles.checkboxSelected : ''}`}>
                  <input type="checkbox" checked={selectedSymptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} className={styles.checkboxInput} />
                  {symptom}
                </label>
              ))}
            </div>
            {fieldErrors.symptoms && <p className={styles.errorMsg}>{fieldErrors.symptoms}</p>}
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className={styles.stepHeading}>Impact & goals</h2>
            <p className={styles.stepDesc}>How much do symptoms affect you, and what brings you to Menowell?</p>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Overall symptom severity</label>
                <div className={styles.radioGroup}>
                  {SEVERITY_OPTIONS.map(opt => (
                    <label key={opt.value} className={`${styles.radioLabel} ${symptomSeverity === opt.value ? styles.radioLabelSelected : ''}`}>
                      <input type="radio" name="severity" value={opt.value} checked={symptomSeverity === opt.value} onChange={e => { setSymptomSeverity(e.target.value); clearFieldError('severity'); }} className={styles.radioInput} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {fieldErrors.severity && <p className={styles.errorMsg}>{fieldErrors.severity}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>What are your goals?</label>
                <p className={styles.fieldDesc}>select all that apply.</p>
                <div className={styles.checkboxGroup}>
                  {GOAL_OPTIONS.map(goal => (
                    <label key={goal} className={`${styles.checkboxLabel} ${goals.includes(goal) ? styles.checkboxSelected : ''}`}>
                      <input type="checkbox" checked={goals.includes(goal)} onChange={() => toggleGoal(goal)} className={styles.checkboxInput} />
                      {goal}
                    </label>
                  ))}
                </div>
                {fieldErrors.goals && <p className={styles.errorMsg}>{fieldErrors.goals}</p>}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className={styles.stepHeading}>You&apos;re all set! 🎉</h2>
            <p className={styles.stepDesc}>
              We&apos;ll personalize Menowell to help you better understand your symptoms and journey.
            </p>
            <div className={styles.avatarSection}>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={styles.avatarCircle}
              >
                {profileImagePreview ? (
                  <Image src={profileImagePreview} alt="Profile" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#627d98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setProfileImage(file)
                    setProfileImagePreview(URL.createObjectURL(file))
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.avatarBtn}
              >
                {profileImagePreview ? 'Change photo' : 'Add a profile photo'}
              </button>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>Your profile</div>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Stage</span>
                  <span className={styles.summaryValue}>{MENSTRUAL_OPTIONS.find(o => o.value === menstrualStatus)?.label}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Symptoms</span>
                  <span className={styles.summaryValue}>{selectedSymptoms.length} selected</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Impact</span>
                  <span className={styles.summaryValue}>{SEVERITY_OPTIONS.find(o => o.value === symptomSeverity)?.label ?? symptomSeverity}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Goal</span>
                  <span className={styles.summaryValue}>Track symptoms, get personalized insights</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          {step > 0 ? (
            <button type="button" className={styles.btnSecondary} onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : <div />}
          <button type="button" className={styles.btnPrimary} disabled={!canProceed() || loading} onClick={handleNext}>
            {loading ? <span className={styles.spinner} /> : step === totalSteps - 1 ? 'Get started & go to dashboard' : 'Continue'}
          </button>
        </div>
      </div>
      {showCelebration && <Celebration />}
    </main>
  )
}
