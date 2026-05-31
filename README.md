# Notation Studio

Describe a piece of music in plain English and get back **editable, playable sheet
notation** — rendered entirely in the browser. Not audio: actual notation you can
read, tweak, and hear.

> **Status:** Frontend-first. The "generate" step is currently **mocked** — it
> returns keyword-matched canned scores. The real text→notation model is the next
> phase. See [Roadmap](#roadmap).

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
| Notation source | Mocked API (`src/api/mockApi.ts`) |

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Project layout

```
src/
  api/
    mockApi.ts          # ← the seam: swap this for a real LLM endpoint
    types.ts            # request/response/error types
  components/
    PromptPanel.tsx     # prompt input, examples, generate button
    ScoreView.tsx       # renders ABC → sheet music (abcjs)
    AbcEditor.tsx       # live-editable ABC source
    PlaybackControls.tsx# audio transport + note highlighting
    Toolbar.tsx         # download / clear actions
  App.tsx               # composition + state
```

## Swapping in a real model

The entire app talks to notation generation through a single function:

```ts
// src/api/mockApi.ts
export async function generateNotation(
  req: GenerateRequest,
): Promise<GenerateResponse> { ... }
```

To go live, replace its body with a `fetch` to your endpoint that returns
`{ abc, source }`. Nothing in the UI needs to change.

## Roadmap

- [ ] Real text→ABC model behind `generateNotation` (likely a fine-tuned LLM)
- [ ] MusicXML export (via `abc2xml`)
- [ ] Multiple voices / instruments
- [ ] Save & share scores

## License

MIT
