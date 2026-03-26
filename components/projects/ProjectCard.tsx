'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteProject, updateProject } from '@/lib/services/projects'
import { EditProjectModal } from './EditProjectModal'

type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
  status?: 'active' | 'on_hold' | 'completed'
}

type Props = {
  project: Project
  onDeleted: () => void
}

const STATUS_STYLES = {
  active: 'bg-green-400/10 text-green-400',
  on_hold: 'bg-yellow-400/10 text-yellow-400',
  completed: 'bg-white/10 text-white/40',
}

const STATUS_LABELS = {
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
}

export function ProjectCard({ project, onDeleted }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [currentProject, setCurrentProject] = useState(project)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

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

  async function handleStatusChange(e: React.MouseEvent, status: 'active' | 'on_hold' | 'completed') {
    e.preventDefault()
    e.stopPropagation()
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('projects').update({ status }).eq('id', currentProject.id)
    setCurrentProject(prev => ({ ...prev, status }))
    setShowStatusMenu(false)
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

  const status = currentProject.status || 'active'

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

          <div className="flex items-start justify-between mb-1 pr-12">
            <h2 className="font-medium text-white">{currentProject.name}</h2>
          </div>

          {currentProject.description && (
            <p className="text-sm text-white/40 line-clamp-2">{currentProject.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-white/20">
              {new Date(currentProject.created_at).toLocaleDateString()}
            </p>

            {/* Status badge */}
            <div className="relative">
              <button
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowStatusMenu(!showStatusMenu)
                }}
                className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${STATUS_STYLES[status]}`}
              >
                {STATUS_LABELS[status]}
              </button>

              {showStatusMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-[#2a2a2a] border border-white/10 rounded-lg overflow-hidden shadow-xl z-10 w-28">
                  {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map(s => (
                    <button
                      key={s}
                      onClick={e => handleStatusChange(e, s)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5 ${
                        status === s ? 'text-white' : 'text-white/50'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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