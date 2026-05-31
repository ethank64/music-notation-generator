interface ToolbarProps {
  abc: string
  onClear: () => void
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Derive a filename from the ABC title (T:) field, falling back to a default.
function filenameFromAbc(abc: string): string {
  const m = abc.match(/^T:\s*(.+)$/m)
  const title = (m?.[1] ?? 'score').trim()
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slug || 'score'}.abc`
}

// Actions over the current score: download as .abc, clear, and a stubbed
// MusicXML export (wired up later via abc2xml).
export default function Toolbar({ abc, onClear }: ToolbarProps) {
  const hasScore = abc.trim().length > 0

  return (
    <div className="toolbar">
      <button
        type="button"
        className="toolbar__btn"
        disabled={!hasScore}
        onClick={() => downloadText(filenameFromAbc(abc), abc, 'text/vnd.abc')}
        title="Download the current notation as an .abc file"
      >
        ⬇ Download .abc
      </button>

      <button
        type="button"
        className="toolbar__btn"
        disabled
        title="Coming soon — export to MusicXML via abc2xml"
      >
        MusicXML (soon)
      </button>

      <button
        type="button"
        className="toolbar__btn toolbar__btn--ghost"
        disabled={!hasScore}
        onClick={onClear}
        title="Clear the current score"
      >
        Clear
      </button>
    </div>
  )
}
