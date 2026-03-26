'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getTasks, updateTaskStatus } from '@/lib/services/tasks'
import { KanbanColumn } from '@/components/tasks/KanbanColumn'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'
import Link from 'next/link'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'

type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  assignee_id: string | null
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'in_progress', title: 'In progress' },
  { id: 'done', title: 'Done' },
]

export default function ProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const refreshTasks = useCallback(async () => {
    const data = await getTasks(id as string)
    setTasks(data)
  }, [id])

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

      try {
        const tasks = await getTasks(id as string)
        setTasks(tasks)
        } catch (err) {
        console.error('getTasks error:', err)
        }
        setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`tasks:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` },
        (payload) => setTasks(prev => [payload.new as Task, ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` },
        (payload) => setTasks(prev => prev.map(task => task.id === payload.new.id ? payload.new as Task : task)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` },
        (payload) => setTasks(prev => prev.filter(task => task.id !== payload.old.id)))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const draggedTask = tasks.find(t => t.id === active.id)
    if (!draggedTask) return

    // over.id could be a column id or a task id
    const overId = over.id as string
    const newStatus = COLUMNS.find(c => c.id === overId)?.id
      ?? tasks.find(t => t.id === overId)?.status

    if (!newStatus || newStatus === draggedTask.status) return

    // Optimistic update
    setTasks(prev =>
      prev.map(t => t.id === draggedTask.id ? { ...t, status: newStatus as Task['status'] } : t)
    )

    await updateTaskStatus(draggedTask.id, newStatus as Task['status'])
  }

  if (loading) return <div className="p-8 text-white/40 text-sm">Loading...</div>
  if (!project) return <div className="p-8 text-white/40 text-sm">Project not found.</div>

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status)

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
            <Link href={`/projects/${id}/files`} className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors">
              Files
            </Link>
            <Link href={`/projects/${id}/members`} className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors">
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active }) => {
            const task = tasks.find(t => t.id === active.id)
            if (task) setActiveTask(task)
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={getColumnTasks(col.id)}
                projectId={id as string}
                onUpdated={refreshTasks}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 px-4 py-3 text-sm text-white/80 shadow-xl">
                {activeTask.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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