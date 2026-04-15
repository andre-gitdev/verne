'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Editor } from '@tiptap/react'
import ExportMenu from './ExportMenu'

interface ToolbarProps {
  projectId: string
  chapterTitle: string
  wordCount: number
  onFontChange: (font: string) => void
  onSizeChange: (size: string) => void
  onLineWidthChange: (width: string) => void
  onFindReplace: () => void
  onSnapshots: () => void
  onBlueLightChange: (enabled: boolean) => void
  isSaving: boolean
  editor: Editor | null
}

export default function Toolbar({
  projectId,
  chapterTitle,
  wordCount,
  onFontChange,
  onSizeChange,
  onLineWidthChange,
  onFindReplace,
  onSnapshots,
  onBlueLightChange,
  isSaving,
  editor,
}: ToolbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [font, setFont] = useState('serif')
  const [size, setSize] = useState('base')
  const [blueLight, setBlueLight] = useState(false)

  function handleFont(f: string) { setFont(f); onFontChange(f) }
  function handleSize(s: string) { setSize(s); onSizeChange(s) }
  function handleBlueLight() {
    const next = !blueLight
    setBlueLight(next)
    onBlueLightChange(next)
  }

  return (
    <div className="fixed top-0 left-64 right-0 z-10 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-100 dark:border-stone-800">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-1">
          {['serif', 'sans'].map(f => (
            <button
              key={f}
              onClick={() => handleFont(f)}
              className={`px-3 py-1 rounded text-xs transition-colors ${font === f
                  ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
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
              className={`px-3 py-1 rounded text-xs transition-colors ${size === s
                  ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
            >
              {s === 'sm' ? 'A' : s === 'base' ? 'Aa' : 'AA'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[
            { label: 'Narrow', value: 'max-w-xl' },
            { label: 'Medium', value: 'max-w-3xl' },
            { label: 'Wide', value: 'max-w-5xl' },
          ].map(w => (
            <button
              key={w.value}
              onClick={() => onLineWidthChange(w.value)}
              className="px-3 py-1 rounded text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {w.label}
            </button>
          ))}
        </div>
        <button
          onClick={onFindReplace}
          className="px-3 py-1 rounded text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Find & replace
        </button>
        <button
          onClick={onSnapshots}
          className="px-3 py-1 rounded text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Snapshots
        </button>
        <ExportMenu editor={editor} chapterTitle={chapterTitle} />
        <button
          onClick={handleBlueLight}
          className={`px-3 py-1 rounded text-xs transition-colors ${blueLight
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
        >
          {blueLight ? 'Warm on' : 'Warm off'}
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-3 py-1 rounded text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
      <div className="flex items-center gap-4 text-xs text-stone-400">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{isSaving ? 'Saving…' : 'Saved'}</span>
      </div>
    </div>
  )
}