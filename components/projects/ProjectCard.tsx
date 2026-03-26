'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteProject } from '@/lib/services/projects'
import { EditProjectModal } from './EditProjectModal'

type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
}

type Props = {
  project: Project
  onDeleted: () => void
}

export function ProjectCard({ project, onDeleted }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [currentProject, setCurrentProject] = useState(project)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project?')) return
    await deleteProject(project.id)
    onDeleted()
  }

  function handleEditClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setShowEdit(true)
  }

  async function handleUpdated() {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single()
    if (data) setCurrentProject(data)
  }

  return (
    <>
      <Link href={`/projects/${currentProject.id}`}>
        <div className="relative bg-[#1a1a1a] rounded-xl border border-white/5 p-5 hover:border-white/20 hover:bg-[#1f1f1f] transition-all cursor-pointer group">
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="text-white/20 hover:text-white/60 transition-colors text-xs"
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              className="text-white/20 hover:text-red-400 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          <h2 className="font-medium text-white mb-1">{currentProject.name}</h2>
          {currentProject.description && (
            <p className="text-sm text-white/40 line-clamp-2">{currentProject.description}</p>
          )}
          <p className="text-xs text-white/20 mt-3">
            {new Date(currentProject.created_at).toLocaleDateString()}
          </p>
        </div>
      </Link>

      {showEdit && (
        <EditProjectModal
          project={currentProject}
          onUpdated={handleUpdated}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}