'use client'
import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { supabase } from '@/lib/supabase'

interface Snapshot { id: string; label: string; created_at: string }

interface SnapshotManagerProps {
  chapterId: string
  editor: Editor | null
  onClose: () => void
}

export default function SnapshotManager({ chapterId, editor, onClose }: SnapshotManagerProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('snapshots')
      .select('id, label, created_at')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setSnapshots(data || []))
  }, [chapterId])

  async function saveSnapshot() {
    if (!editor || !label.trim()) return
    setSaving(true)
    const content = editor.getJSON()
    const { data } = await supabase
      .from('snapshots')
      .insert({ chapter_id: chapterId, label: label.trim(), content })
      .select()
      .single()
    if (data) setSnapshots(prev => [data, ...prev])
    setLabel('')
    setSaving(false)
  }

  async function restoreSnapshot(id: string) {
    const { data } = await supabase
      .from('snapshots')
      .select('content')
      .eq('id', id)
      .single()
    if (data && editor) {
      editor.commands.setContent(data.content)
    }
    onClose()
  }

  return (
    <div className="absolute top-16 right-6 z-20 w-80 bg-white rounded-lg border border-stone-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-600">Version snapshots</span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xs">✕</button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Snapshot label"
          value={label}
          onChange={e => setLabel(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
        <button
          onClick={saveSnapshot}
          disabled={saving || !label.trim()}
          className="px-3 py-1.5 rounded bg-stone-800 text-white text-xs font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          Save
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {snapshots.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-4">No snapshots yet</p>
        ) : (
          snapshots.map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-100">
              <div>
                <p className="text-xs font-medium text-stone-700">{s.label}</p>
                <p className="text-xs text-stone-400">{new Date(s.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => restoreSnapshot(s.id)}
                className="text-xs px-2 py-1 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}