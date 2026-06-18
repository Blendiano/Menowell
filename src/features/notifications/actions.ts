'use server'

import { requireAuth } from '@/lib/require-auth'
import { revalidatePath } from 'next/cache'
import { markAsRead as markAsReadService, markAllAsRead as markAllAsReadService } from '@/services/notification-service'

export async function markAsRead(notificationId: string) {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  try {
    await markAsReadService(notificationId, userId)
    revalidatePath('/notifications')
    return { data: { success: true } }
  } catch (error) {
    console.error('markAsRead error:', error)
    return { error: 'Failed to mark notification as read.' }
  }
}

export async function markAllAsRead() {
  let userId: string
  try { userId = await requireAuth() } catch { return { error: 'Not authenticated.' } }

  try {
    await markAllAsReadService(userId)
    revalidatePath('/notifications')
    return { data: { success: true } }
  } catch (error) {
    console.error('markAllAsRead error:', error)
    return { error: 'Failed to mark all as read.' }
  }
}
