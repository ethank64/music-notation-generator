// Shared types for the notation-generation API layer.
// This is the seam between the UI and whatever produces notation.
// Today it's a mock; later it'll be a real LLM endpoint that returns ABC.

export interface GenerateRequest {
  /** The user's free-text description of the music they want. */
  prompt: string
}

export interface GenerateResponse {
  /** ABC notation source string, ready to hand to abcjs. */
  abc: string
  /** Human-readable label for which mock template answered (debug/UX). */
  source: string
}

export class GenerationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GenerationError'
  }
}
