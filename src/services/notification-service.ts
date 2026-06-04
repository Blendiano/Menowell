import { prisma } from '@/lib/prisma'

export async function getNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { status: 'READ' },
  })
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, status: 'UNREAD' },
    data: { status: 'READ' },
  })
}

export async function createNotification(userId: string, message: string) {
  return prisma.notification.create({
    data: { userId, message },
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, status: 'UNREAD' },
  })
}
