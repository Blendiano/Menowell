import { prisma } from '@/lib/prisma'

export async function determineMenopauseStage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dateOfBirth: true },
  })
  if (!user?.dateOfBirth) return null

  const today = new Date()
  const birth = user.dateOfBirth
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  let stageName: string
  let confidenceScore: number

  if (age < 40) {
    stageName = 'premenopausal'
    confidenceScore = 0.9
  } else if (age < 45) {
    stageName = 'perimenopausal_early'
    confidenceScore = 0.7
  } else if (age < 50) {
    stageName = 'perimenopausal_late'
    confidenceScore = 0.7
  } else if (age < 55) {
    stageName = 'menopausal'
    confidenceScore = 0.8
  } else {
    stageName = 'postmenopausal'
    confidenceScore = 0.8
  }

  const result = await prisma.menopauseStage.upsert({
    where: { userId },
    create: { userId, stageName, confidenceScore },
    update: { stageName, confidenceScore },
    select: { id: true, stageName: true, confidenceScore: true },
  })
  return { ...result, confidenceScore: Number(result.confidenceScore) }
}

export async function getStage(userId: string) {
  const result = await prisma.menopauseStage.findFirst({
    where: { userId },
    select: { id: true, stageName: true, confidenceScore: true, updatedAt: true },
  })
  if (!result) return null
  return { ...result, confidenceScore: Number(result.confidenceScore) }
}
