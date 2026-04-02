'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProjects } from '@/lib/services/projects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { NewProjectModal } from '@/components/projects/NewProjectModal'
import { AIProjectModal } from '@/components/projects/AIProjectModal'
import { OnboardingModal } from '@/components/ui/OnboardingModal'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Project } from '@/lib/types'
import { useSearchParams } from 'next/navigation'

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const data = await getProjects(user.id)
      setProjects(data)
      setLoading(false)

      if (data.length === 0 && !searchParams.get('ai') && !searchParams.get('new')) {
        setShowOnboarding(true)
      }

      if (searchParams.get('ai') === 'true') setShowAIModal(true)
      if (searchParams.get('new') === 'true') setShowModal(true)
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="rounded-lg bg-white/5 border border-white/10 text-white/60 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              ✨ AI generate
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              New project
            </button>
          </div>
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
        ) : projects.length === 0 && !showOnboarding ? (
          <div className="text-center py-16">
            <p className="text-white/40 mb-4">No projects yet.</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowAIModal(true)}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors"
              >
                ✨ Generate with AI →
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors"
              >
                Create manually →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} onDeleted={refresh} />
            ))}
          </div>
        )}
      </div>

      {showOnboarding && userId && (
        <OnboardingModal
          userId={userId}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {showModal && userId && (
        <NewProjectModal
          userId={userId}
          onCreated={refresh}
          onClose={() => setShowModal(false)}
        />
      )}

      {showAIModal && userId && (
        <AIProjectModal
          userId={userId}
          onCreated={refresh}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  )
}

export default function ProjectsPageWrapper() {
  return (
    <Suspense>
      <ProjectsPage />
    </Suspense>
  )
}
