import systemPrompts from '../prompts/system-prompts.json'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatWithOpenRouter(
  messages: OpenRouterMessage[],
  options?: { model?: string; maxTokens?: number }
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) throw new Error('VITE_OPENROUTER_API_KEY is not set')

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : undefined,
    } as HeadersInit,
    body: JSON.stringify({
      model: options?.model ?? 'openai/gpt-4o-mini',
      messages,
      max_tokens: options?.maxTokens ?? 550,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content?.trim()
  return content ?? ''
}

export async function getAssistantReply(
  sectionLabel: string,
  intendedQuestion: string,
  userMessage: string,
  conversationSummary?: string
): Promise<string> {
  const system = (systemPrompts as { chat: { system: string } }).chat.system
    .replace('{{sectionLabel}}', sectionLabel)
    .replace('{{intendedQuestion}}', intendedQuestion)
  const user = conversationSummary
    ? `Recent context: ${conversationSummary}. User just said: ${userMessage}`
    : `User just said: ${userMessage}`

  const content = await chatWithOpenRouter([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ])
  return content || intendedQuestion
}
