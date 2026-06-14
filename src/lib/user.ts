import 'server-only'
import { auth } from './auth'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, onboardingCompleted: true },
  })

  return user
}
