// The notation-generation provider seam.
//
// Everything server-side talks to the model through NotationProvider, so the
// underlying model is swappable without touching the HTTP handler. It uses the
// Vercel AI SDK against Vercel AI Gateway, so the model is just a
// "provider/model" string — switching vendors (OpenAI, Anthropic, Google, a
// future fine-tuned model) is a one-line change with no code edits.

import { generateText } from 'ai'
import { SYSTEM_PROMPT, buildUserMessage, sanitizeAbc } from './prompt.js'

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

// Default model routed through AI Gateway. Override with NOTATION_MODEL, e.g.
// "anthropic/claude-sonnet-4.6", "google/gemini-2.5-flash", or eventually your
// own fine-tuned ABC model registered with the gateway.
const DEFAULT_MODEL = 'openai/gpt-4o-mini'

class GatewayProvider implements NotationProvider {
  private model: string

  constructor(model: string) {
    this.model = model
  }

  async generate(prompt: string): Promise<{ abc: string; source: string }> {
    let raw: string
    try {
      // The AI SDK reads credentials automatically: AI_GATEWAY_API_KEY locally,
      // or the Vercel OIDC token when deployed on Vercel (no key needed).
      const result = await generateText({
        model: this.model,
        temperature: 0.8,
        system: SYSTEM_PROMPT,
        prompt: buildUserMessage(prompt),
      })
      raw = result.text
    } catch (err) {
      const status =
        err && typeof err === 'object' && 'statusCode' in err
          ? Number((err as { statusCode: unknown }).statusCode) || 502
          : 502
      throw new ProviderError(
        'The notation model could not be reached. Please try again.',
        status,
      )
    }

    const abc = sanitizeAbc(raw)
    if (!abc || !/^X:\s*\d/m.test(abc)) {
      throw new ProviderError(
        'The model did not return valid notation. Try rephrasing your request.',
        502,
      )
    }

    return { abc, source: `gateway:${this.model}` }
  }
}

// Build the provider from environment configuration. On Vercel the gateway is
// authenticated via OIDC automatically; locally it needs AI_GATEWAY_API_KEY.
export function createProvider(): NotationProvider {
  const hasCredential =
    !!process.env.AI_GATEWAY_API_KEY || !!process.env.VERCEL_OIDC_TOKEN
  if (!hasCredential) {
    throw new ProviderError(
      'Server is not configured: set AI_GATEWAY_API_KEY (or deploy on Vercel for OIDC auth).',
      500,
    )
  }
  return new GatewayProvider(process.env.NOTATION_MODEL || DEFAULT_MODEL)
}
