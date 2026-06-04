import { env } from '@/lib/env'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

type TMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type TOpenAIResponse = {
  choices: Array<{
    message: { content: string }
  }>
}

export async function generateChatCompletion(messages: TMessage[]): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = (await response.json()) as TOpenAIResponse
  return data.choices[0]?.message?.content ?? 'No response generated.'
}

export async function generateWellnessInsight(symptomSummary: string): Promise<string> {
  const systemPrompt = `You are a compassionate menopause wellness coach. Provide a brief, personalized insight based on the user's symptom logs. Follow these rules:
- Be warm, supportive, and evidence-based
- Never diagnose a medical condition
- Never prescribe medication or treatment
- Never claim to be a doctor
- Keep responses to 2-4 sentences
- End with: "This information is educational and not medical advice."`

  const insight = await generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Based on these recent symptoms, provide a brief wellness insight:\n\n${symptomSummary}` },
  ])

  return insight
}
