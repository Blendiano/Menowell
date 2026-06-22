import 'server-only'
import type { User } from '@prisma/client'
import { auth } from './auth'
import { prisma } from './prisma'

type UserSelect = Pick<User, 'id' | 'name' | 'email' | 'image'> & { onboardingCompleted: boolean }

const userSelect = { id: true, name: true, email: true, image: true, onboardingCompleted: true } as const

export async function getUserById(id: string): Promise<UserSelect | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  })
}

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return getUserById(session.user.id)
}
