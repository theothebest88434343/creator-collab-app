'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProjects } from '@/lib/services/projects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { NewProjectModal } from '@/components/projects/NewProjectModal'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const data = await getProjects(user.id)
      setProjects(data)
      setLoading(false)
    }
    load()
  }, [])

  async function refresh() {
    if (!userId) return
    const data = await getProjects(userId)
    setProjects(data)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-white">My Projects</h1>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
          >
            New project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-xl border border-white/5 p-5 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 mb-4">No projects yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-white/60 text-sm font-medium hover:text-white transition-colors"
            >
              Create your first project →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} onDeleted={refresh} />
            ))}
          </div>
        )}
      </div>

      {showModal && userId && (
        <NewProjectModal
          userId={userId}
          onCreated={refresh}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}