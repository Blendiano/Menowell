'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { markAsRead as markAsReadService, markAllAsRead as markAllAsReadService } from '@/services/notification-service'

export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  try {
    await markAsReadService(notificationId, session.user.id)
    revalidatePath('/notifications')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to mark notification as read.' }
  }
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  try {
    await markAllAsReadService(session.user.id)
    revalidatePath('/notifications')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to mark all as read.' }
  }
}
