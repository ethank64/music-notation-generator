import { useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import type { TuneObject } from 'abcjs'

interface ScoreViewProps {
  abc: string
  /** Called after each successful render with the parsed tune (for playback). */
  onRender?: (tune: TuneObject | null) => void
  /** Called when abcjs reports a parse warning/error. */
  onParseError?: (message: string | null) => void
}

// Renders an ABC string as engraved sheet music (SVG) via abcjs.
// Re-renders whenever the ABC changes.
export default function ScoreView({
  abc,
  onRender,
  onParseError,
}: ScoreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (!abc.trim()) {
      containerRef.current.innerHTML = ''
      onRender?.(null)
      onParseError?.(null)
      return
    }

    const tunes = abcjs.renderAbc(containerRef.current, abc, {
      responsive: 'resize',
      add_classes: true,
      paddingtop: 8,
      paddingbottom: 16,
    })

    const tune = tunes[0] ?? null
    onRender?.(tune)
    const warnings = tune?.warnings
    onParseError?.(warnings?.length ? warnings.join('\n') : null)
  }, [abc, onRender, onParseError])

  return <div className="score-view" ref={containerRef} aria-label="Sheet music" />
}
