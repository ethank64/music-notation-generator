// Mock notation-generation API.
//
// This module is the ONLY place that knows notation comes from a fake source.
// When the real LLM is ready, replace the body of `generateNotation` with a
// `fetch` to your endpoint that returns `{ abc, source }` — the UI won't change.

import { GenerationError } from './types'
import type { GenerateRequest, GenerateResponse } from './types'

interface Template {
  /** Keywords that route a prompt to this template. */
  match: string[]
  source: string
  abc: string
}

// A small library of canned ABC pieces. Keyword-matched against the prompt so
// the mock feels responsive to what the user typed.
const TEMPLATES: Template[] = [
  {
    match: ['waltz', '3/4', 'triple'],
    source: 'mock:waltz',
    abc: `X:1
T:Generated Waltz
C:Mock Notation Engine
M:3/4
L:1/8
Q:1/4=140
K:G
|: D2 |"G" G2 B2 d2 |"D" A2 F2 D2 |"C" E2 G2 c2 |"G" B4 D2 |
|"G" G2 B2 d2 |"Em" g2 f2 e2 |"D7" d2 c2 A2 |"G" G4 :|`,
  },
  {
    match: ['sad', 'minor', 'melancholy', 'dark', 'somber', 'mournful'],
    source: 'mock:minor-air',
    abc: `X:1
T:Melancholy Air
C:Mock Notation Engine
M:4/4
L:1/8
Q:1/4=72
K:Am
|:"Am" A2 c2 e2 a2 |"Dm" f2 e2 d2 c2 |"E7" B2 A2 ^G2 B2 |"Am" A6 z2 :|
|"F" c2 c2 A2 F2 |"C" e2 e2 c2 G2 |"Dm" d2 c2"E7" B2 ^G2 |"Am" A6 z2 |`,
  },
  {
    match: ['jazz', 'swing', 'blues', 'bebop'],
    source: 'mock:jazz-lead',
    abc: `X:1
T:Blue Note Lead
C:Mock Notation Engine
M:4/4
L:1/8
Q:1/4=120
K:C
|"C7" E2 G2 _B2 G2 |"F7" A2 c2 _e2 c2 |"C7" G2 E2 C2 _E2 |"G7" _B,2 D2 F2 _A2 |
|"C7" c2 _B2 G2 E2 |"A7" =c2 A2 ^F2 A2 |"D7" d2"G7" _B2"C7" c4 |]`,
  },
  {
    match: ['fast', 'reel', 'lively', 'upbeat', 'energetic', 'jig'],
    source: 'mock:reel',
    abc: `X:1
T:The Quick Reel
C:Mock Notation Engine
M:4/4
L:1/8
Q:1/4=180
K:D
|:"D" FAdf"D" afdf |"A" ecAc"A" ecAc |"G" Bdgb"D" afdf |"A" e2 dc"D" d4 :|
|:"D" adfd"A" adfd |"G" gbeg"D" fdAF |"D" FAdf"A" ecAc |"D" d2 cd"D" d4 :|`,
  },
  {
    match: ['hymn', 'chorale', 'solemn', 'peaceful', 'gentle', 'calm'],
    source: 'mock:chorale',
    abc: `X:1
T:Quiet Chorale
C:Mock Notation Engine
M:4/4
L:1/4
Q:1/4=66
K:F
|"F" F A c"C" c |"Dm" d c"Bb" A F |"F" G F"C7" E G |"F" F3 z |
|"Bb" B A G"F" F |"C" G E"F" F2 |"Dm" A G"C" G E |"F" F3 z |]`,
  },
]

// Fallback when nothing matches: a friendly major-key melody.
const DEFAULT_TEMPLATE: Template = {
  match: [],
  source: 'mock:default-melody',
  abc: `X:1
T:Untitled Melody
C:Mock Notation Engine
M:4/4
L:1/8
Q:1/4=110
K:C
|"C" G2 E2 C2 E2 |"G" D2 G2 B2 d2 |"Am" c2 A2"F" A2 c2 |"G" B2 G2 G4 |
|"C" E2 G2 c2 e2 |"F" d2 c2"G" B2 A2 |"C" G2 E2"G7" D2 F2 |"C" C6 z2 |]`,
}

function pickTemplate(prompt: string): Template {
  const p = prompt.toLowerCase()
  for (const t of TEMPLATES) {
    if (t.match.some((kw) => p.includes(kw))) return t
  }
  return DEFAULT_TEMPLATE
}

// Simulate realistic network/inference latency.
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate music notation from a text prompt.
 *
 * MOCK IMPLEMENTATION — returns a keyword-matched canned ABC score after a
 * simulated delay. Swap this body for a real LLM call when ready; keep the
 * same signature so the UI stays untouched.
 */
export async function generateNotation(
  req: GenerateRequest,
): Promise<GenerateResponse> {
  const prompt = req.prompt.trim()

  if (!prompt) {
    throw new GenerationError('Please describe the music you want to generate.')
  }

  // Simulate inference time (600–1400ms).
  await delay(600 + (prompt.length % 800))

  // Simulate an occasional backend failure so the UI's error path is real.
  // Deterministic trigger: lets you demo the error state on demand.
  if (prompt.toLowerCase().includes('fail')) {
    throw new GenerationError(
      'The notation engine could not fulfill that request. Try rephrasing.',
    )
  }

  const template = pickTemplate(prompt)
  return { abc: template.abc, source: template.source }
}
