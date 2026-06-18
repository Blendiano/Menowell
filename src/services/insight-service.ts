import { prisma } from '@/lib/prisma'
import { openAiClient } from '@/lib/ai/openai'

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
    select: { id: true },
  })
}

export async function getLatestInsight(userId: string) {
  return prisma.aIInsight.findFirst({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  })
}

export async function generateWellnessInsight(symptomSummary: string): Promise<string> {
  const systemPrompt = `You are a compassionate menopause wellness coach. Provide a brief, personalized insight based on the user's symptom logs. Follow these rules:
  - Be warm, supportive, and evidence-based
  - Never diagnose a medical condition
  - Never prescribe medication or treatment
  - Never claim to be a doctor
  - Keep responses to 2-4 sentences
  - End with: "This information is educational and not medical advice."`

  return openAiClient.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Based on these recent symptoms, provide a brief wellness insight:\n\n${symptomSummary}` },
  ])
}
