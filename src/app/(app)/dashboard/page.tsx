'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Project { id: string; title: string; updated_at: string }

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('projects')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false })
      setProjects(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  async function createProject() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: project } = await supabase
      .from('projects')
      .insert({ title: 'Untitled project', user_id: user.id })
      .select()
      .single()
    if (!project) return
    const { data: chapter } = await supabase
      .from('chapters')
      .insert({ project_id: project.id, title: 'Chapter 1', position: 0 })
      .select()
      .single()
    if (chapter) router.push(`/editor/${chapter.id}`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">
      Loading…
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium text-stone-800">Verne</h1>
          <button
            onClick={createProject}
            className="px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            New project
          </button>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-24 text-stone-400 text-sm">
            No projects yet — create one to get started.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/${p.id}`)}
                className="p-4 bg-white rounded-lg border border-stone-200 cursor-pointer hover:border-stone-300 transition-colors"
              >
                <p className="text-sm font-medium text-stone-800">{p.title}</p>
                <p className="text-xs text-stone-400 mt-1">
                  Updated {new Date(p.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}