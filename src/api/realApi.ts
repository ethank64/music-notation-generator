// Real notation API client: calls the serverless /api/generate endpoint, which
// proxies the LLM. Mirrors the mockApi signature so the two are interchangeable.

import { GenerationError } from './types'
import type { GenerateRequest, GenerateResponse } from './types'

export async function generateNotation(
  req: GenerateRequest,
): Promise<GenerateResponse> {
  const prompt = req.prompt.trim()
  if (!prompt) {
    throw new GenerationError('Please describe the music you want to generate.')
  }

  let res: Response
  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
  } catch {
    throw new GenerationError(
      'Could not reach the server. Check your connection and try again.',
    )
  }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // fall through to status-based error below
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : null) ?? 'Something went wrong generating notation.'
    throw new GenerationError(message)
  }

  const obj = (data ?? {}) as Partial<GenerateResponse>
  if (typeof obj.abc !== 'string' || !obj.abc.trim()) {
    throw new GenerationError('The server returned an empty score.')
  }

  return { abc: obj.abc, source: obj.source ?? 'api' }
}
