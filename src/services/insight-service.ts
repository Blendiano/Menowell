import { prisma } from '@/lib/prisma'

export async function getInsights(userId: string, limit = 20) {
  return prisma.aIInsight.findMany({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
    take: limit,
  })
}

export async function createInsight(userId: string, insightText: string) {
  return prisma.aIInsight.create({
    data: { userId, insightText },
  })
}

export async function getLatestInsight(userId: string) {
  return prisma.aIInsight.findFirst({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  })
}
