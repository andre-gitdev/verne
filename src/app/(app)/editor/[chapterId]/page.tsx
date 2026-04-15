'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import Toolbar from '@/components/editor/Toolbar'
import FindReplace from '@/components/editor/FindReplace'
import GoalTracker from '@/components/editor/GoalTracker'
import SnapshotManager from '@/components/editor/SnapshotManager'
import Sidebar from '@/components/editor/Sidebar'
import { Editor as TiptapEditor } from '@tiptap/react'

const Editor = dynamic(() => import('@/components/editor/Editor'), { ssr: false })

interface Chapter {
  id: string
  title: string
  status: 'outline' | 'draft' | 'revised' | 'final'
  word_count: number
  word_count_target: number | null
  position: number
}

export default function EditorPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const router = useRouter()
  const [chapter, setChapter] = useState<{ content: object | null; title: string; project_id: string } | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [wordCount, setWordCount] = useState(0)
  const [sessionWords, setSessionWords] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [font, setFont] = useState('serif')
  const [size, setSize] = useState('base')
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showSnapshots, setShowSnapshots] = useState(false)
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null)
  const initialWordCount = useRef<number | null>(null)

  const fontMap: Record<string, string> = { serif: 'font-serif', sans: 'font-sans' }
  const sizeMap: Record<string, string> = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('chapters')
        .select('content, title, project_id')
        .eq('id', chapterId)
        .single()
      if (!data) return
      setChapter(data)
      const { data: siblings } = await supabase
        .from('chapters')
        .select('id, title, status, word_count, word_count_target, position')
        .eq('project_id', data.project_id)
        .order('position', { ascending: true })
      setChapters(siblings || [])
    }
    load()
  }, [chapterId, router])

  function handleWordCountChange(words: number) {
    if (initialWordCount.current === null) initialWordCount.current = words
    setWordCount(words)
    setSessionWords(Math.max(0, words - initialWordCount.current))
  }

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">
      Loading…
    </div>
  )

  return (
    <div className={`flex h-screen ${fontMap[font]} ${sizeMap[size]}`}>
      <Sidebar
        projectId={chapter.project_id}
        chapters={chapters}
        activeChapterId={chapterId}
        onChaptersChange={setChapters}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Toolbar
          projectId={chapter.project_id}
          wordCount={wordCount}
          onFontChange={setFont}
          onSizeChange={setSize}
          onFindReplace={() => setShowFindReplace(prev => !prev)}
          onSnapshots={() => setShowSnapshots(prev => !prev)}
          isSaving={isSaving}
        />
        {showFindReplace && (
          <FindReplace editor={activeEditor} onClose={() => setShowFindReplace(false)} />
        )}
        {showSnapshots && (
          <SnapshotManager
            chapterId={chapterId}
            editor={activeEditor}
            onClose={() => setShowSnapshots(false)}
          />
        )}
        <div className="flex-1 overflow-y-auto pt-14 pb-12 bg-stone-50">
          <Editor
            chapterId={chapterId}
            initialContent={chapter.content}
            onWordCountChange={handleWordCountChange}
            onEditorReady={setActiveEditor}
          />
        </div>
        <GoalTracker sessionWords={sessionWords} totalWords={wordCount} />
      </div>
    </div>
  )
}