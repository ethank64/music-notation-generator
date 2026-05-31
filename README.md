# Notation Studio

Describe a piece of music in plain English and get back **editable, playable sheet
notation** — rendered entirely in the browser. Not audio: actual notation you can
read, tweak, and hear.

> **Status:** The frontend is complete. A serverless backend that proxies a real
> LLM is now in place (`/api/generate`), but the app **defaults to a local mock**
> so it runs offline with no API key. Flip `VITE_USE_MOCK=false` to use the live
> model. See [Backend](#backend--llm-proxy).

## What it does

- **Describe → notation.** Type a prompt (or pick an example) and get a score.
- **Render.** Engraved sheet music via [abcjs](https://www.abcjs.net/) (clefs,
  time signatures, chord symbols, tempo markings).
- **Edit.** The raw [ABC notation](https://abcnotation.com/) source is shown in a
  live editor — change it and the score re-renders instantly.
- **Play.** Built-in Web Audio playback with a transport bar, tempo control, and a
  cursor that highlights each note as it sounds.
- **Export.** Download the current score as a `.abc` file. (MusicXML export is
  stubbed for a future release.)

## Why ABC notation?

ABC is a compact, text-based music format. It's the working representation here
because it's also the most practical target for a language model: it's ASCII,
fits easily in a context window, and is simple to validate. The eventual LLM will
emit ABC, which this frontend already renders, edits, and plays.

## Tech stack

| Concern | Choice |
| --- | --- |
| Build / dev server | Vite |
| UI | React 19 + TypeScript |
| Notation render + edit + playback | abcjs (MIT) |
| Styling | Plain CSS |
| Backend | TypeScript serverless functions (Vercel) |
| LLM | OpenAI (or any OpenAI-compatible endpoint) |
| Notation source | Mock (`src/api/mockApi.ts`) or live (`/api/generate`) |

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Project layout

```
api/                      # serverless backend (Node/TypeScript, Vercel)
  generate.ts             # POST /api/generate — LLM proxy, holds the API key
  _lib/
    provider.ts           # NotationProvider seam (OpenAI today, your model later)
    prompt.ts             # system prompt + ABC sanitizer
src/
  api/
    notationApi.ts        # ← picks mock vs real backend (VITE_USE_MOCK)
    mockApi.ts            # in-browser canned scores (offline dev)
    realApi.ts            # fetches /api/generate
    types.ts              # shared request/response/error types
  components/
    PromptPanel.tsx       # prompt input, examples, generate button
    ScoreView.tsx         # renders ABC → sheet music (abcjs)
    AbcEditor.tsx         # live-editable ABC source
    PlaybackControls.tsx  # audio transport + note highlighting
    Toolbar.tsx           # download / clear actions
  App.tsx                 # composition + state
```

## Backend / LLM proxy

The OpenAI key **cannot** live in the browser, so generation runs through a
serverless function. The browser calls `/api/generate`; that function holds the
key server-side and talks to the model.

The model sits behind a single interface so it's swappable without touching the
HTTP layer or the UI:

```ts
// api/_lib/provider.ts
export interface NotationProvider {
  generate(prompt: string): Promise<{ abc: string; source: string }>
}
```

It uses OpenAI's Chat Completions API with a **configurable base URL**, so the
exact same code targets OpenAI now and any OpenAI-compatible endpoint later
(vLLM, TGI, Together, a self-hosted fine-tuned model) — just by changing env
vars. That's the path from "OpenAI for now" to "my own ABC model."

### Configuration

Copy `.env.example` to `.env` and fill in:

| Var | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes (live) | Server-side key. Never exposed to the browser. |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini`. |
| `OPENAI_BASE_URL` | no | Point at any OpenAI-compatible endpoint. |
| `VITE_USE_MOCK` | no | `false` → call the live backend. Defaults to mock. |

### Running the backend locally

`npm run dev` (Vite) serves only the frontend, so the mock is used. To exercise
the real `/api/generate` function locally, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev            # serves frontend + /api together
```

…with `VITE_USE_MOCK=false` and `OPENAI_API_KEY` set in your `.env`.

## Roadmap

- [x] Serverless LLM proxy behind a swappable provider interface
- [ ] Fine-tuned text→ABC model (swap in via `OPENAI_BASE_URL`)
- [ ] MusicXML export (via `abc2xml` — deferred; no good pure-JS converter)
- [ ] Multiple voices / instruments
- [ ] Save & share scores

## License

MIT
