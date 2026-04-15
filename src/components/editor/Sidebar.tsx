'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'

interface Chapter {
  id: string
  title: string
  status: 'outline' | 'draft' | 'revised' | 'final'
  word_count: number
  word_count_target: number | null
  position: number
}

interface SidebarProps {
  projectId: string
  chapters: Chapter[]
  activeChapterId: string
  onChaptersChange: (chapters: Chapter[]) => void
}

const statusColors: Record<string, string> = {
  outline: 'bg-stone-100 text-stone-500',
  draft: 'bg-amber-50 text-amber-600',
  revised: 'bg-blue-50 text-blue-600',
  final: 'bg-green-50 text-green-700',
}

function SortableChapter({
  chapter,
  isActive,
  onClick,
  onStatusChange,
  onTargetChange,
}: {
  chapter: Chapter
  isActive: boolean
  onClick: () => void
  onStatusChange: (id: string, status: Chapter['status']) => void
  onTargetChange: (id: string, target: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const progress = chapter.word_count_target
    ? Math.min(100, Math.round((chapter.word_count / chapter.word_count_target) * 100))
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border p-3 cursor-pointer transition-colors ${
        isActive ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-stone-300 hover:text-stone-400 select-none"
          onClick={e => e.stopPropagation()}
        >
          ⠿
        </span>
        <span className={`text-sm font-medium truncate flex-1 ${isActive ? 'text-white' : 'text-stone-800'}`}>
          {chapter.title}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-5" onClick={e => e.stopPropagation()}>
        <select
          value={chapter.status}
          onChange={e => onStatusChange(chapter.id, e.target.value as Chapter['status'])}
          className={`text-xs rounded px-1.5 py-0.5 border-0 font-medium cursor-pointer ${statusColors[chapter.status]}`}
        >
          <option value="outline">Outline</option>
          <option value="draft">Draft</option>
          <option value="revised">Revised</option>
          <option value="final">Final</option>
        </select>
        <span className={`text-xs ${isActive ? 'text-stone-400' : 'text-stone-400'}`}>
          {chapter.word_count.toLocaleString()}w
        </span>
      </div>
      {chapter.word_count_target && (
        <div className="ml-5 mt-2" onClick={e => e.stopPropagation()}>
          <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-1 bg-green-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-stone-400 mt-0.5 block">{progress}% of {chapter.word_count_target.toLocaleString()} target</span>
        </div>
      )}
      <div className="ml-5 mt-2" onClick={e => e.stopPropagation()}>
        <input
          type="number"
          placeholder="Set word target"
          defaultValue={chapter.word_count_target || ''}
          onBlur={e => {
            const val = parseInt(e.target.value)
            if (!isNaN(val) && val > 0) onTargetChange(chapter.id, val)
          }}
          className="w-full text-xs px-1.5 py-0.5 rounded border border-stone-200 text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
        />
      </div>
    </div>
  )
}

export default function Sidebar({ projectId, chapters, activeChapterId, onChaptersChange }: SidebarProps) {
  const router = useRouter()
  const [items, setItems] = useState(chapters)
  const sensors = useSensors(useSensor(PointerSensor))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(c => c.id === active.id)
    const newIndex = items.findIndex(c => c.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex).map((c, i) => ({ ...c, position: i }))
    setItems(reordered)
    onChaptersChange(reordered)
    await Promise.all(
      reordered.map(c => supabase.from('chapters').update({ position: c.position }).eq('id', c.id))
    )
  }

  async function handleStatusChange(id: string, status: Chapter['status']) {
    setItems(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    await supabase.from('chapters').update({ status }).eq('id', id)
  }

  async function handleTargetChange(id: string, target: number) {
    setItems(prev => prev.map(c => c.id === id ? { ...c, word_count_target: target } : c))
    await supabase.from('chapters').update({ word_count_target: target }).eq('id', id)
  }

  async function addChapter() {
    const position = items.length
    const { data } = await supabase
      .from('chapters')
      .insert({ project_id: projectId, title: `Chapter ${position + 1}`, position })
      .select()
      .single()
    if (data) {
      const newChapter = { ...data, word_count: 0, word_count_target: null }
      setItems(prev => [...prev, newChapter])
      router.push(`/editor/${data.id}`)
    }
  }

  return (
    <div className="w-64 min-w-64 h-screen bg-stone-50 border-r border-stone-200 flex flex-col">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700">Chapters</span>
        <button
          onClick={addChapter}
          className="text-xs px-2 py-1 rounded bg-stone-800 text-white hover:bg-stone-700 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {items.map(chapter => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                isActive={chapter.id === activeChapterId}
                onClick={() => router.push(`/editor/${chapter.id}`)}
                onStatusChange={handleStatusChange}
                onTargetChange={handleTargetChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}