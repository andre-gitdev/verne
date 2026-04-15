'use client'
import { useState, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { exportToDocx } from '@/lib/export/toDocx'
import { exportToMarkdown, exportToPlainText } from '@/lib/export/toMarkdown'
import { exportToPdf } from '@/lib/export/toPdf'
import { importFromDocx } from '@/lib/import/fromDocx'

interface ExportMenuProps {
  editor: Editor | null
  chapterTitle: string
}

export default function ExportMenu({ editor, chapterTitle }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport(type: 'docx' | 'md' | 'txt' | 'pdf') {
    if (!editor) return
    const content = editor.getJSON()
    setOpen(false)
    if (type === 'docx') await exportToDocx(content as never, chapterTitle)
    if (type === 'md') exportToMarkdown(content as never, chapterTitle)
    if (type === 'txt') exportToPlainText(content as never, chapterTitle)
    if (type === 'pdf') exportToPdf(content as never, chapterTitle)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const html = await importFromDocx(file)
    editor.commands.setContent(html)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`px-3 py-1 rounded text-xs transition-colors ${
          open ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-100'
        }`}
      >
        Export / Import
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-30 w-44 bg-white rounded-lg border border-stone-200 shadow-sm py-1">
          <p className="text-xs text-stone-400 px-3 py-1.5 font-medium">Export as</p>
          {[
            { label: 'Word (.docx)', type: 'docx' as const },
            { label: 'Markdown (.md)', type: 'md' as const },
            { label: 'Plain text (.txt)', type: 'txt' as const },
            { label: 'PDF (.pdf)', type: 'pdf' as const },
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => handleExport(opt.type)}
              className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {opt.label}
            </button>
          ))}
          <div className="border-t border-stone-100 mt-1 pt-1">
            <p className="text-xs text-stone-400 px-3 py-1.5 font-medium">Import</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
            >
              From .docx file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      )}
    </div>
  )
}