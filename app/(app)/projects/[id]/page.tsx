'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getTasks } from '@/lib/services/tasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'
import Link from 'next/link'

export default function ProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      setProject(project)

      const tasks = await getTasks(id as string)
      setTasks(tasks)
      setLoading(false)
    }
    load()
  }, [id])

  async function refreshTasks() {
    const tasks = await getTasks(id as string)
    setTasks(tasks)
  }

  if (loading) return <div className="p-8 text-white/40 text-sm">Loading...</div>
  if (!project) return <div className="p-8 text-white/40 text-sm">Project not found.</div>

  const todo = tasks.filter(t => t.status === 'todo')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/projects" className="text-sm text-white/40 hover:text-white/70 mb-2 block transition-colors">
              ← All projects
            </Link>
            <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-white/40 mt-1 text-sm">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${id}/files`}
              className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors"
            >
              Files
            </Link>
            <Link
              href={`/projects/${id}/members`}
              className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors"
            >
              Members
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              + New task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <h2 className="text-xs font-medium text-white/30 uppercase tracking-wide mb-3 flex items-center gap-2">
              To do <span className="bg-white/10 text-white/50 rounded-full px-2 py-0.5 text-xs">{todo.length}</span>
            </h2>
            <div className="space-y-2">
              {todo.map(task => (
                <TaskCard key={task.id} task={task} onUpdated={refreshTasks} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium text-white/30 uppercase tracking-wide mb-3 flex items-center gap-2">
              In progress <span className="bg-white/10 text-white/50 rounded-full px-2 py-0.5 text-xs">{inProgress.length}</span>
            </h2>
            <div className="space-y-2">
              {inProgress.map(task => (
                <TaskCard key={task.id} task={task} onUpdated={refreshTasks} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium text-white/30 uppercase tracking-wide mb-3 flex items-center gap-2">
              Done <span className="bg-white/10 text-white/50 rounded-full px-2 py-0.5 text-xs">{done.length}</span>
            </h2>
            <div className="space-y-2">
              {done.map(task => (
                <TaskCard key={task.id} task={task} onUpdated={refreshTasks} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && userId && (
        <NewTaskModal
          projectId={id as string}
          userId={userId}
          onCreated={refreshTasks}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}