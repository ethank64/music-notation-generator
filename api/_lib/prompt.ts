// The system prompt that instructs the model to return ABC notation.
//
// Kept in its own module so it can be reused/tuned independently of the
// provider wiring, and eventually replaced by a fine-tuned model that needs
// little or no prompting.

export const SYSTEM_PROMPT = `You are a music notation engine. Given a plain-language description of a piece of music, you output a single valid piece of ABC notation that captures it.

Rules:
- Respond with ABC notation ONLY. No prose, no explanation, no markdown code fences.
- Always include these header fields, in order: X:1, a T: title derived from the request, M: (meter), L: (default note length), Q: (tempo as 1/4=bpm), K: (key).
- Choose key, meter, and tempo that match the description (e.g. "sad" -> a minor key and slower tempo; "waltz" -> 3/4; "lively reel" -> faster).
- Add chord symbols in quotes where appropriate (e.g. "G", "Em").
- Keep it to a short, coherent phrase of roughly 8-16 bars unless the request asks for more.
- Ensure the notation parses cleanly: matched barlines, valid note durations for the given L:, and notes within a singable range.`

export function buildUserMessage(prompt: string): string {
  return `Write ABC notation for this request:\n\n${prompt.trim()}`
}

// Models sometimes wrap output in ``` fences or add stray prose despite
// instructions. Strip fences and trim to the ABC body (from the first X: line).
export function sanitizeAbc(raw: string): string {
  let text = raw.trim()

  // Remove surrounding markdown code fences if present.
  const fence = text.match(/^```(?:abc)?\s*\n([\s\S]*?)\n```$/i)
  if (fence) text = fence[1].trim()

  // Drop any leading prose before the first ABC header line (X:).
  const xIndex = text.search(/^X:\s*\d/m)
  if (xIndex > 0) text = text.slice(xIndex)

  return text.trim()
}
