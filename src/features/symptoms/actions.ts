'use server'

import { requireAuth } from '@/lib/require-auth'
import { revalidatePath } from 'next/cache'
import { createSymptomLog as createSymptomLogService, getSymptomLogs } from '@/services/symptom-service'
import { CreateSymptomSchema } from '@/services/symptom-service'

type TCreateSymptomResult =
  | { data: { id: string } }
  | { error: string }

export async function createSymptomLog(
  input: unknown
): Promise<TCreateSymptomResult> {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  const parsed = CreateSymptomSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid symptom data.' }

  try {
    const log = await createSymptomLogService(userId, parsed.data)
    revalidatePath('/symptoms')
    revalidatePath('/dashboard')
    return { data: log }
  } catch (error) {
    console.error('createSymptomLog error:', error)
    return { error: 'Failed to save symptom log.' }
  }
}

export async function getSymptomHistory() {
  let userId: string
  try { userId = await requireAuth() } catch { return [] }

  try {
    return getSymptomLogs(userId)
  } catch (error) {
    console.error('getSymptomHistory error:', error)
    return []
  }
}
