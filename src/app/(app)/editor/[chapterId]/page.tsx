'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import Toolbar from '@/components/editor/Toolbar'
import FindReplace from '@/components/editor/FindReplace'
import { Editor as TiptapEditor } from '@tiptap/react'

const Editor = dynamic(() => import('@/components/editor/Editor'), { ssr: false })

export default function EditorPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const router = useRouter()
  const [chapter, setChapter] = useState<{ content: object | null; title: string } | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [font, setFont] = useState('serif')
  const [size, setSize] = useState('base')
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null)

  const fontMap: Record<string, string> = {
    serif: 'font-serif',
    sans: 'font-sans',
  }
  const sizeMap: Record<string, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('chapters')
        .select('content, title')
        .eq('id', chapterId)
        .single()
      if (data) setChapter(data)
    }
    load()
  }, [chapterId, router])

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">
      Loading…
    </div>
  )

  return (
    <div className={`min-h-screen bg-stone-50 ${fontMap[font]} ${sizeMap[size]}`}>
      <Toolbar
        wordCount={wordCount}
        onFontChange={setFont}
        onSizeChange={setSize}
        onFindReplace={() => setShowFindReplace(prev => !prev)}
        isSaving={isSaving}
      />
      {showFindReplace && (
        <FindReplace
          editor={activeEditor}
          onClose={() => setShowFindReplace(false)}
        />
      )}
      <div className="pt-14 relative">
        <Editor
          chapterId={chapterId}
          initialContent={chapter.content}
          onWordCountChange={setWordCount}
          onEditorReady={setActiveEditor}
        />
      </div>
    </div>
  )
}