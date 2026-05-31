import { useCallback, useState } from 'react'
import type { TuneObject } from 'abcjs'
import { generateNotation } from './api/mockApi'
import { GenerationError } from './api/types'
import PromptPanel from './components/PromptPanel'
import ScoreView from './components/ScoreView'
import AbcEditor from './components/AbcEditor'
import PlaybackControls from './components/PlaybackControls'
import Toolbar from './components/Toolbar'
import './App.css'

export default function App() {
  const [abc, setAbc] = useState('')
  const [tune, setTune] = useState<TuneObject | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const handleGenerate = useCallback(async (prompt: string) => {
    setLoading(true)
    setGenError(null)
    try {
      const res = await generateNotation({ prompt })
      setAbc(res.abc)
    } catch (err) {
      const message =
        err instanceof GenerationError
          ? err.message
          : 'Something went wrong generating notation.'
      setGenError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasScore = abc.trim().length > 0

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Notation Studio</h1>
        <p className="app__subtitle">
          Describe a piece of music and get editable, playable sheet notation —
          rendered right in your browser.
        </p>
      </header>

      <main className="app__main">
        <aside className="app__sidebar">
          <PromptPanel
            onGenerate={handleGenerate}
            loading={loading}
            error={genError}
          />
        </aside>

        <section className="app__workspace">
          <Toolbar abc={abc} onClear={() => setAbc('')} />

          <div className="app__score-pane">
            {hasScore ? (
              <ScoreView
                abc={abc}
                onRender={setTune}
                onParseError={setParseError}
              />
            ) : (
              <div className="app__empty">
                <p>Your generated score will appear here.</p>
                <p className="app__empty-hint">
                  Try one of the examples on the left to get started.
                </p>
              </div>
            )}
          </div>

          {hasScore && <PlaybackControls tune={tune} />}

          {hasScore && (
            <AbcEditor value={abc} onChange={setAbc} parseError={parseError} />
          )}
        </section>
      </main>

      <footer className="app__footer">
        Notation rendered &amp; played with{' '}
        <a href="https://www.abcjs.net/" target="_blank" rel="noreferrer">
          abcjs
        </a>
        . Notation is currently mocked — the LLM comes next.
      </footer>
    </div>
  )
}
