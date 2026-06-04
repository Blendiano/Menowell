'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const SymptomLogSchema = z.object({
  symptomName: z.enum([
    'hot_flash', 'night_sweat', 'fatigue', 'insomnia', 'anxiety',
    'mood_swing', 'brain_fog', 'joint_pain', 'headache', 'other',
  ]),
  severity: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
})

type TCreateSymptomResult =
  | { data: { id: string } }
  | { error: string }

export async function createSymptomLog(
  input: z.infer<typeof SymptomLogSchema>
): Promise<TCreateSymptomResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const parsed = SymptomLogSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid symptom data.' }

  try {
    const log = await prisma.symptomLog.create({
      data: {
        userId: session.user.id,
        symptomName: parsed.data.symptomName,
        severity: parsed.data.severity,
        notes: parsed.data.notes ?? null,
      },
    })
    revalidatePath('/symptoms')
    revalidatePath('/dashboard')
    return { data: { id: log.id } }
  } catch {
    return { error: 'Failed to save symptom log.' }
  }
}

export async function getSymptomHistory() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.symptomLog.findMany({
    where: { userId: session.user.id },
    orderBy: { loggedAt: 'desc' },
    take: 50,
  })
}
