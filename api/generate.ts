// POST /api/generate
//
// Vercel serverless function that proxies the LLM. The browser never sees the
// API key — it calls this endpoint, which holds the key server-side and talks
// to the model through the NotationProvider seam.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createProvider, ProviderError } from './_lib/provider.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  // Body may arrive parsed (Vercel) or as a raw string; handle both.
  let prompt: unknown
  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body
    prompt = body?.prompt
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body.' })
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res
      .status(400)
      .json({ error: 'Please describe the music you want to generate.' })
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt is too long.' })
  }

  try {
    const provider = createProvider()
    const result = await provider.generate(prompt)
    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof ProviderError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Unexpected error in /api/generate:', err)
    return res
      .status(500)
      .json({ error: 'Something went wrong generating notation.' })
  }
}
