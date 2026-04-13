'use client'
import { useState, useCallback } from 'react'
import { Editor } from '@tiptap/react'

interface FindReplaceProps {
    editor: Editor | null
    onClose: () => void
}

export default function FindReplace({ editor, onClose }: FindReplaceProps) {
    const [find, setFind] = useState('')
    const [replace, setReplace] = useState('')
    const [matchCount, setMatchCount] = useState<number | null>(null)

    const countMatches = useCallback((term: string) => {
        if (!editor || !term) { setMatchCount(null); return }
        const text = editor.getText()
        const matches = text.toLowerCase().split(term.toLowerCase()).length - 1
        setMatchCount(matches)
    }, [editor])

    function handleFindChange(val: string) {
        setFind(val)
        countMatches(val)
    }

    function handleReplace() {
        if (!editor || !find) return
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to)
        if (selectedText.toLowerCase() === find.toLowerCase()) {
            editor.chain().focus().insertContent(replace).run()
        }
        handleFindNext()
    }

    function handleReplaceAll() {
        if (!editor || !find) return
        const content = editor.getHTML()
        const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        const newContent = content.replace(regex, replace)
        editor.commands.setContent(newContent)
        setMatchCount(0)
    }

    function handleFindNext() {
    (window as unknown as { find: (s: string, caseSensitive: boolean, backwards: boolean, wrap: boolean) => boolean }).find(find, false, false, true)
    }

    function handleFindPrev() {
    (window as unknown as { find: (s: string, caseSensitive: boolean, backwards: boolean, wrap: boolean) => boolean }).find(find, false, true, true)
    }

    return (
        <div className="absolute top-16 right-6 z-20 w-80 bg-white rounded-lg border border-stone-200 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-600">Find & replace</span>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xs">✕</button>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Find"
                        value={find}
                        onChange={e => handleFindChange(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                    <button
                        onClick={handleFindPrev}
                        className="px-2 py-1.5 rounded border border-stone-200 text-stone-500 text-xs hover:bg-stone-50"
                    >↑</button>
                    <button
                        onClick={handleFindNext}
                        className="px-2 py-1.5 rounded border border-stone-200 text-stone-500 text-xs hover:bg-stone-50"
                    >↓</button>
                </div>
                {matchCount !== null && (
                    <span className="text-xs text-stone-400">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
                )}
                <input
                    type="text"
                    placeholder="Replace with"
                    value={replace}
                    onChange={e => setReplace(e.target.value)}
                    className="px-3 py-1.5 rounded border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleReplace}
                        className="flex-1 py-1.5 rounded bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors"
                    >
                        Replace
                    </button>
                    <button
                        onClick={handleReplaceAll}
                        className="flex-1 py-1.5 rounded bg-stone-800 text-white text-xs font-medium hover:bg-stone-700 transition-colors"
                    >
                        Replace all
                    </button>
                </div>
            </div>
        </div>
    )
}