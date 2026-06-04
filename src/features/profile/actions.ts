'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { updateProfile as updateProfileService, determineMenopauseStage, UpdateProfileSchema } from '@/services/user-service'
import { signOut } from '@/lib/auth'

export async function updateProfile(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }

  try {
    await updateProfileService(session.user.id, parsed.data)
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to update profile.' }
  }
}

export async function determineStage() {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  try {
    const stage = await determineMenopauseStage(session.user.id)
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { data: stage }
  } catch {
    return { error: 'Failed to determine stage.' }
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}
