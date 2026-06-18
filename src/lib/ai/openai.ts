import { env } from '@/lib/env'

type AiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

type TOpenAIResponse = {
  choices: Array<{
    message: { content: string }
  }>
}

const TIMEOUT_MS = 30_000

export const openAiClient = {
  async generateChatCompletion(messages: AiMessage[]): Promise<string> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
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
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '(unable to read body)')
        throw new Error(`OpenAI API error: ${response.status} — ${body}`)
      }

      const data = (await response.json()) as TOpenAIResponse
      return data.choices[0]?.message?.content ?? 'No response generated.'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('OpenAI request timed out after 30 seconds')
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  },
}
