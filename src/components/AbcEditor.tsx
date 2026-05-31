interface AbcEditorProps {
  value: string
  onChange: (next: string) => void
  /** Parse warnings from abcjs, shown beneath the editor. */
  parseError?: string | null
}

// A plain editable text area holding the raw ABC source. Edits flow up via
// onChange; the parent re-renders the score live as the text changes.
export default function AbcEditor({
  value,
  onChange,
  parseError,
}: AbcEditorProps) {
  return (
    <div className="editor">
      <div className="editor__header">
        <span className="editor__label">ABC source</span>
        {parseError && <span className="editor__warn">⚠ check syntax</span>}
      </div>
      <textarea
        className="editor__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="ABC notation will appear here. You can edit it directly and the score updates live."
        aria-label="ABC notation source"
      />
      {parseError && <pre className="editor__error">{parseError}</pre>}
    </div>
  )
}
