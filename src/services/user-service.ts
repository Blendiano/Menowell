import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.string().optional(),
  notificationPreference: z.coerce.boolean().optional(),
})

export type TUpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      dateOfBirth: true,
      preferredLanguage: true,
      notificationPreference: true,
      createdAt: true,
    },
  })
}

export async function updateProfile(userId: string, input: TUpdateProfileInput) {
  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.message)

  const data: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) data.name = parsed.data.name
  if (parsed.data.dateOfBirth !== undefined) data.dateOfBirth = new Date(parsed.data.dateOfBirth)
  if (parsed.data.preferredLanguage !== undefined) data.preferredLanguage = parsed.data.preferredLanguage
  if (parsed.data.notificationPreference !== undefined) data.notificationPreference = parsed.data.notificationPreference

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      dateOfBirth: true,
      preferredLanguage: true,
      notificationPreference: true,
    },
  })
}

export async function determineMenopauseStage(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.dateOfBirth) return null

  const age = new Date().getFullYear() - user.dateOfBirth.getFullYear()
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

  const existing = await prisma.menopauseStage.findFirst({
    where: { userId },
  })
  if (existing) {
    return prisma.menopauseStage.update({
      where: { id: existing.id },
      data: { stageName, confidenceScore },
    })
  }

  return prisma.menopauseStage.create({
    data: { userId, stageName, confidenceScore },
  })
}

export async function getStage(userId: string) {
  return prisma.menopauseStage.findFirst({ where: { userId } })
}
