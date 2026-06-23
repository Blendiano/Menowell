'use server'

import { requireAuth } from '@/lib/require-auth'
import { revalidatePath } from 'next/cache'
import { updateProfile as updateProfileService, UpdateProfileSchema } from '@/services/profile-service'
import { determineMenopauseStage } from '@/services/stage-service'
import { signOut } from '@/lib/auth'

export async function updateProfile(input: unknown) {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  try {
    await updateProfileService(userId, parsed.data)
    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')
    return { data: { success: true } }
  } catch (error) {
    console.error('updateProfile error:', error)
    return { error: 'Failed to update profile.' }
  }
}

export async function determineStage() {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  try {
    const stage = await determineMenopauseStage(userId)
    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')
    return { data: stage }
  } catch (error) {
    console.error('determineStage error:', error)
    return { error: 'Failed to determine stage.' }
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}
