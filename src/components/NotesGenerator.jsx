import { useRef, useState } from 'react'
import { generateNotes } from '../services/gemini.js'
import {
  extractTextFromFile,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_MB,
} from '../services/fileParser.js'
import NotesOutput from './NotesOutput.jsx'

const MIN_CHARS = 100
const MAX_CHARS = 100000

const NOTE_STYLES = [
  { value: 'bullets', label: 'Bullet points' },
  { value: 'outline', label: 'Structured outline' },
  { value: 'detailed', label: 'Detailed summary' },
  { value: 'qa', label: 'Q&A flashcards' },
]

export default function NotesGenerator() {
  const [mode, setMode] = useState('paste') // 'paste' | 'upload'
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [style, setStyle] = useState('bullets')
  const [status, setStatus] = useState('idle') // idle | parsing | generating | done
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const charCount = text.length
  const canGenerate =
    charCount >= MIN_CHARS && charCount <= MAX_CHARS && status !== 'generating'

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setStatus('parsing')
    try {
      const extracted = await extractTextFromFile(file)
      const trimmed = extracted.replace(/\s+\n/g, '\n').trim()
      if (trimmed.length < MIN_CHARS) {
        throw new Error(
          `This file contains only ${trimmed.length} characters of text — at least ${MIN_CHARS} are needed to create useful notes.`,
        )
      }
      setText(trimmed.slice(0, MAX_CHARS))
      setFileName(file.name)
      setStatus('idle')
    } catch (err) {
      setStatus('idle')
      setFileName('')
      setError(err.message)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleGenerate = async () => {
    setError('')
    setStatus('generating')
    try {
      const result = await generateNotes(text.slice(0, MAX_CHARS), style)
      setNotes(result)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  const handleReset = () => {
    setNotes('')
    setText('')
    setFileName('')
    setError('')
    setStatus('idle')
  }

  if (status === 'done') {
    return <NotesOutput notes={notes} onReset={handleReset} />
  }

  return (
    <div className="tool-card">
      <p className="tool-card-label">Paste or upload your material to generate notes</p>

      <div className="mode-tabs" role="tablist" aria-label="Input method">
        <button
          role="tab"
          aria-selected={mode === 'paste'}
          className={`mode-tab ${mode === 'paste' ? 'active' : ''}`}
          onClick={() => setMode('paste')}
        >
          📋 Paste text
        </button>
        <button
          role="tab"
          aria-selected={mode === 'upload'}
          className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          ⬆️ Upload file
        </button>
      </div>

      {mode === 'paste' ? (
        <div className="input-zone">
          <textarea
            className="paste-area"
            placeholder="Paste your lecture, article, chapter, or any study material here (minimum 100 characters)…"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setFileName('')
            }}
            maxLength={MAX_CHARS}
          />
          <div className={`char-count ${charCount > 0 && charCount < MIN_CHARS ? 'warn' : ''}`}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            {charCount > 0 && charCount < MIN_CHARS && ` — at least ${MIN_CHARS} needed`}
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            hidden
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          {status === 'parsing' ? (
            <p className="dropzone-title">Reading your file…</p>
          ) : fileName ? (
            <>
              <p className="dropzone-title">✅ {fileName}</p>
              <p className="dropzone-hint">
                {charCount.toLocaleString()} characters extracted. Click to choose a
                different file.
              </p>
            </>
          ) : (
            <>
              <p className="dropzone-title">Drag &amp; drop your file here</p>
              <p className="dropzone-hint">
                or click to browse — PDF, DOCX, TXT, MD (max {MAX_FILE_MB} MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="tool-error" role="alert">
          {error}
        </p>
      )}

      <div className="tool-card-footer">
        <label className="style-select-label">
          Note style
          <select
            className="style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {NOTE_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-primary"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {status === 'generating' ? (
            <>
              <span className="spinner" aria-hidden="true" /> Creating notes…
            </>
          ) : (
            'Create notes'
          )}
        </button>
      </div>
    </div>
  )
}
