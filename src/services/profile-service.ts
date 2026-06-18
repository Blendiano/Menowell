import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.string().optional(),
  notificationPreference: z.coerce.boolean().optional(),
  image: z.string().optional(),
  onboardingCompleted: z.coerce.boolean().optional(),
})

export type TUpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, image: true,
      dateOfBirth: true, preferredLanguage: true,
      notificationPreference: true, createdAt: true,
    },
  })
  return user
}

export async function updateProfile(userId: string, input: TUpdateProfileInput) {
  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.message)

  const data: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) data.name = parsed.data.name
  if (parsed.data.dateOfBirth !== undefined) data.dateOfBirth = new Date(parsed.data.dateOfBirth)
  if (parsed.data.preferredLanguage !== undefined) data.preferredLanguage = parsed.data.preferredLanguage
  if (parsed.data.notificationPreference !== undefined) data.notificationPreference = parsed.data.notificationPreference
  if (parsed.data.image !== undefined) data.image = parsed.data.image
  if (parsed.data.onboardingCompleted !== undefined) data.onboardingCompleted = parsed.data.onboardingCompleted

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, image: true,
      dateOfBirth: true, preferredLanguage: true,
      notificationPreference: true, createdAt: true,
    },
  })
  return user
}
