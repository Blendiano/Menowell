'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const parsed = OnboardingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        menstrualStatus: parsed.data.menstrualStatus,
        selectedSymptoms: JSON.stringify(parsed.data.selectedSymptoms),
        symptomSeverity: parsed.data.symptomSeverity,
        goals: JSON.stringify(parsed.data.goals),
        image: parsed.data.profileImage ?? null,
        onboardingCompleted: true,
      },
    })

    revalidatePath('/dashboard')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to save onboarding data.' }
  }
}
