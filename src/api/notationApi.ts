// Single entry point the UI imports for notation generation.
//
// Selects the mock or the real backend based on VITE_USE_MOCK. The default is
// the mock, so `npm run dev` works offline with no API key. Set
// VITE_USE_MOCK=false (and run via `vercel dev`, or deploy) to hit the real
// /api/generate endpoint.

import { generateNotation as generateMock } from './mockApi'
import { generateNotation as generateReal } from './realApi'

// Vite exposes env vars as strings; treat anything other than an explicit
// "false" as mock-enabled to stay safe by default.
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const generateNotation = useMock ? generateMock : generateReal

export const usingMock = useMock
