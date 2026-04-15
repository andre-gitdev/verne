'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/editor/Sidebar'

interface Chapter {
  id: string
  title: string
  status: 'outline' | 'draft' | 'revised' | 'final'
  word_count: number
  word_count_target: number | null
  position: number
}

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [projectTitle, setProjectTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: project } = await supabase
        .from('projects')
        .select('title')
        .eq('id', projectId)
        .single()
      if (project) setProjectTitle(project.title)
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, title, status, word_count, word_count_target, position')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
      setChapters(chapters || [])
      setLoading(false)
      if (chapters && chapters.length > 0) {
        router.push(`/editor/${chapters[0].id}`)
      }
    }
    load()
  }, [projectId, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">
      Loading…
    </div>
  )

  return (
    <div className="flex h-screen">
      <Sidebar
        projectId={projectId}
        chapters={chapters}
        activeChapterId=""
        onChaptersChange={setChapters}
      />
      <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
        Select a chapter to begin writing
      </div>
    </div>
  )
}