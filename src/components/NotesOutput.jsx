import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function NotesOutput({ notes, onReset }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable (e.g. non-secure context) — ignore */
    }
  }

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'notes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="notes-output">
      <div className="notes-output-toolbar">
        <span className="notes-output-title">Your notes are ready</span>
        <div className="notes-output-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleDownload}>
            Download .txt
          </button>
          <button className="btn btn-outline btn-sm" onClick={onReset}>
            New notes
          </button>
        </div>
      </div>
      <article className="notes-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
      </article>
    </div>
  )
}
