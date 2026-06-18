import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const CreateSymptomSchema = z.object({
  symptomName: z.enum([
    'hot_flash', 'night_sweat', 'fatigue', 'insomnia', 'anxiety',
    'mood_swing', 'brain_fog', 'joint_pain', 'headache', 'other',
  ]),
  severity: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
})

export type TCreateSymptomInput = z.infer<typeof CreateSymptomSchema>

function getMostCommon(items: string[]): string | null {
  if (items.length === 0) return null
  const freq: Record<string, number> = {}
  items.forEach(i => { freq[i] = (freq[i] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

export async function getSymptomLogs(userId: string) {
  return prisma.symptomLog.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 50,
  })
}

export async function createSymptomLog(userId: string, input: TCreateSymptomInput) {
  const parsed = CreateSymptomSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.message)

  return prisma.symptomLog.create({
    data: {
      userId,
      symptomName: parsed.data.symptomName,
      severity: parsed.data.severity,
      notes: parsed.data.notes ?? null,
    },
    select: { id: true },
  })
}

export async function getRecentSymptomSummary(userId: string, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const logs = await prisma.symptomLog.findMany({
    where: { userId, loggedAt: { gte: since } },
    orderBy: { loggedAt: 'desc' },
  })

  return {
    total: logs.length,
    averageSeverity: logs.length > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.severity, 0) / logs.length)
      : 0,
    mostCommon: getMostCommon(logs.map(l => l.symptomName)),
    logs,
  }
}
