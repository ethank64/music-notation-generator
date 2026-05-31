// The notation-generation provider seam.
//
// Everything server-side talks to the model through NotationProvider, so the
// underlying model is swappable without touching the HTTP handler. Today it's
// OpenAI (or any OpenAI-compatible endpoint via OPENAI_BASE_URL); later it can
// be a fine-tuned ABC model served behind the same interface.

import OpenAI from 'openai'
import { SYSTEM_PROMPT, buildUserMessage, sanitizeAbc } from './prompt'

export interface NotationProvider {
  /** Generate ABC notation for a free-text prompt. */
  generate(prompt: string): Promise<{ abc: string; source: string }>
}

export class ProviderError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.name = 'ProviderError'
    this.status = status
  }
}

class OpenAIProvider implements NotationProvider {
  private client: OpenAI
  private model: string

  constructor(opts: { apiKey: string; baseURL?: string; model: string }) {
    this.client = new OpenAI({
      apiKey: opts.apiKey,
      // When set, points at any OpenAI-compatible server (vLLM, TGI, Together,
      // a self-hosted fine-tuned model). When unset, the SDK uses OpenAI.
      baseURL: opts.baseURL || undefined,
    })
    this.model = opts.model
  }

  async generate(prompt: string): Promise<{ abc: string; source: string }> {
    let completion
    try {
      completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.8,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserMessage(prompt) },
        ],
      })
    } catch (err) {
      const status =
        err && typeof err === 'object' && 'status' in err
          ? Number((err as { status: unknown }).status) || 502
          : 502
      throw new ProviderError(
        'The notation model could not be reached. Please try again.',
        status,
      )
    }

    const raw = completion.choices[0]?.message?.content ?? ''
    const abc = sanitizeAbc(raw)
    if (!abc || !/^X:\s*\d/m.test(abc)) {
      throw new ProviderError(
        'The model did not return valid notation. Try rephrasing your request.',
        502,
      )
    }

    return { abc, source: `openai:${this.model}` }
  }
}

// Build the provider from environment configuration. Throws a clear error if
// the API key is missing so the handler can return a sensible message.
export function createProvider(): NotationProvider {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new ProviderError(
      'Server is not configured: OPENAI_API_KEY is missing.',
      500,
    )
  }
  return new OpenAIProvider({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  })
}
