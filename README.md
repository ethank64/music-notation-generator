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
| LLM | Vercel AI SDK → AI Gateway (any provider via `provider/model`) |
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
    provider.ts           # NotationProvider seam (AI Gateway; any provider/model)
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

API credentials **cannot** live in the browser, so generation runs through a
serverless function. The browser calls `/api/generate`; that function talks to
the model server-side.

The model sits behind a single interface so it's swappable without touching the
HTTP layer or the UI:

```ts
// api/_lib/provider.ts
export interface NotationProvider {
  generate(prompt: string): Promise<{ abc: string; source: string }>
}
```

It uses the **Vercel AI SDK** routed through **[AI Gateway](https://vercel.com/docs/ai-gateway)**,
so the model is just a `provider/model` string. Switching vendors — OpenAI,
Anthropic, Google, xAI, or eventually your own fine-tuned ABC model — is a
one-line change (the `NOTATION_MODEL` env var) with no code edits, no per-vendor
SDKs, and one unified bill. That's the path from "a hosted model for now" to "my
own ABC model."

Auth is nearly free on Vercel: deployed functions authenticate to the gateway
via **OIDC automatically**, so no key needs to be set in production. Locally you
provide an `AI_GATEWAY_API_KEY`.

### Configuration

Copy `.env.example` to `.env` and fill in:

| Var | Required | Purpose |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | local only | Gateway key (`vck_…`). On Vercel, OIDC is used automatically. |
| `NOTATION_MODEL` | no | `provider/model`. Defaults to `openai/gpt-4o-mini`. |
| `VITE_USE_MOCK` | no | `false` → call the live backend. Defaults to mock. |

### Running the backend locally

`npm run dev` (Vite) serves only the frontend, so the mock is used. To exercise
the real `/api/generate` function locally, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev            # serves frontend + /api together
```

…with `VITE_USE_MOCK=false` and `AI_GATEWAY_API_KEY` set in your `.env`.

## Roadmap

- [x] Serverless LLM proxy behind a swappable provider interface
- [x] Multi-vendor model routing via Vercel AI Gateway
- [x] GitHub auto-deploy via Vercel Git integration
- [ ] Fine-tuned text→ABC model (swap in via `NOTATION_MODEL`)
- [ ] MusicXML export (via `abc2xml` — deferred; no good pure-JS converter)
- [ ] Multiple voices / instruments
- [ ] Save & share scores

## License

MIT
