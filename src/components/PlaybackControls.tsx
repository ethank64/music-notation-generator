import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import type {
  TuneObject,
  CursorControl,
  NoteTimingEvent,
  SynthObjectController,
} from 'abcjs'

interface PlaybackControlsProps {
  /** The currently rendered tune, or null if the score is empty/invalid. */
  tune: TuneObject | null
}

// A cursor controller that highlights the sounding notes by toggling a CSS
// class on their SVG elements as abcjs plays through the tune.
function makeCursorControl(): CursorControl {
  let highlighted: Element[] = []
  const clear = () => {
    for (const el of highlighted) el.classList.remove('abcjs-note-playing')
    highlighted = []
  }
  return {
    onStart() {
      clear()
    },
    onFinished() {
      clear()
    },
    onEvent(event: NoteTimingEvent) {
      clear()
      const els = (event.elements ?? []).flat() as Element[]
      for (const el of els) el.classList.add('abcjs-note-playing')
      highlighted = els
    },
  }
}

// Wraps abcjs.synth.SynthController, which renders its own transport UI
// (play / pause / progress / tempo) and handles Web Audio for us.
export default function PlaybackControls({ tune }: PlaybackControlsProps) {
  const controlRef = useRef<HTMLDivElement>(null)
  const synthRef = useRef<SynthObjectController | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  )

  const supported = abcjs.synth.supportsAudio()

  // Create the controller once and mount its UI into our container.
  useEffect(() => {
    if (!supported || !controlRef.current) return
    const controller = new abcjs.synth.SynthController()
    controller.load(controlRef.current, makeCursorControl(), {
      displayPlay: true,
      displayProgress: true,
      displayWarp: true,
    })
    synthRef.current = controller
  }, [supported])

  // Load each new tune into the controller (builds the audio buffer).
  useEffect(() => {
    const controller = synthRef.current
    if (!controller || !tune) return
    let cancelled = false
    setStatus('loading')
    controller
      .setTune(tune, false)
      .then(() => {
        if (!cancelled) setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [tune])

  if (!supported) {
    return (
      <div className="playback playback--unsupported">
        Audio playback isn’t supported in this browser.
      </div>
    )
  }

  return (
    <div className="playback">
      <div className="playback__transport" ref={controlRef} />
      {status === 'loading' && (
        <span className="playback__hint">Preparing audio…</span>
      )}
      {status === 'error' && (
        <span className="playback__hint playback__hint--error">
          Couldn’t load audio for this score.
        </span>
      )}
      {!tune && status === 'idle' && (
        <span className="playback__hint">Generate a score to enable playback.</span>
      )}
    </div>
  )
}
