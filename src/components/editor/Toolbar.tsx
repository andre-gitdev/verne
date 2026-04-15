'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ToolbarProps {
  projectId: string
  wordCount: number
  onFontChange: (font: string) => void
  onSizeChange: (size: string) => void
  onFindReplace: () => void
  onSnapshots: () => void
  isSaving: boolean
}

export default function Toolbar({
  projectId,
  wordCount,
  onFontChange,
  onSizeChange,
  onFindReplace,
  onSnapshots,
  isSaving,
}: ToolbarProps) {
  const router = useRouter()
  const [font, setFont] = useState('serif')
  const [size, setSize] = useState('base')

  function handleFont(f: string) {
    setFont(f)
    onFontChange(f)
  }

  function handleSize(s: string) {
    setSize(s)
    onSizeChange(s)
  }

  return (
    <div className="fixed top-0 left-64 right-0 z-10 flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur border-b border-stone-100">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/dashboard/${projectId}`)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-1">
          {['serif', 'sans'].map(f => (
            <button
              key={f}
              onClick={() => handleFont(f)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                font === f ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {f === 'serif' ? 'Serif' : 'Sans'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['sm', 'base', 'lg'].map(s => (
            <button
              key={s}
              onClick={() => handleSize(s)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                size === s ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {s === 'sm' ? 'A' : s === 'base' ? 'Aa' : 'AA'}
            </button>
          ))}
        </div>
        <button
          onClick={onFindReplace}
          className="px-3 py-1 rounded text-xs text-stone-500 hover:bg-stone-100 transition-colors"
        >
          Find & replace
        </button>
        <button
          onClick={onSnapshots}
          className="px-3 py-1 rounded text-xs text-stone-500 hover:bg-stone-100 transition-colors"
        >
          Snapshots
        </button>
      </div>
      <div className="flex items-center gap-4 text-xs text-stone-400">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{isSaving ? 'Saving…' : 'Saved'}</span>
      </div>
    </div>
  )
}