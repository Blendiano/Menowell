'use server'

import { requireAuth } from '@/lib/require-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { updateProfile } from '@/services/profile-service'

const OnboardingSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  menstrualStatus: z.enum(['STILL_MENSTRUATING', 'IRREGULAR', 'NO_PERIOD_12M', 'NOT_SURE']),
  selectedSymptoms: z.array(z.string()).min(1, 'Select at least one symptom'),
  symptomSeverity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  profileImage: z.string().optional(),
})

export type TOnboardingInput = z.infer<typeof OnboardingSchema>

export async function saveOnboarding(input: unknown) {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  const parsed = OnboardingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }

  try {
    const parts = parsed.data.dateOfBirth.split('/')
    const normalizedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : parsed.data.dateOfBirth

    await updateProfile(userId, {
      dateOfBirth: normalizedDate,
      onboardingCompleted: true,
      ...(parsed.data.profileImage ? { image: parsed.data.profileImage } : {}),
    })

    revalidatePath('/dashboard')
    return { data: { success: true } }
  } catch (error) {
    console.error('saveOnboarding error:', error)
    return { error: 'Failed to save onboarding data.' }
  }
}


