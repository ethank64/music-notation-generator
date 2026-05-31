import { useState } from 'react'

interface PromptPanelProps {
  onGenerate: (prompt: string) => void
  loading: boolean
  error: string | null
}

const EXAMPLES = [
  'A gentle waltz in G major',
  'A sad, slow melody in a minor key',
  'An upbeat Irish reel',
  'A bluesy jazz lead line',
]

// Left-hand panel: the text prompt, generate button, loading/error states,
// and a few example chips to seed ideas.
export default function PromptPanel({
  onGenerate,
  loading,
  error,
}: PromptPanelProps) {
  const [prompt, setPrompt] = useState('')

  const submit = () => {
    if (!loading && prompt.trim()) onGenerate(prompt)
  }

  return (
    <section className="prompt">
      <label className="prompt__label" htmlFor="prompt-input">
        Describe the music you want
      </label>
      <textarea
        id="prompt-input"
        className="prompt__input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
        }}
        rows={3}
        placeholder="e.g. A cheerful folk tune in D major with a lively rhythm"
        disabled={loading}
      />

      <div className="prompt__examples">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="prompt__chip"
            onClick={() => setPrompt(ex)}
            disabled={loading}
          >
            {ex}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="prompt__generate"
        onClick={submit}
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Generating…' : 'Generate notation'}
      </button>
      <span className="prompt__kbd">⌘/Ctrl + Enter</span>

      {error && <p className="prompt__error">{error}</p>}
    </section>
  )
}
