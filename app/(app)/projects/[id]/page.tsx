'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getTasks, updateTaskStatus } from '@/lib/services/tasks'
import { KanbanColumn } from '@/components/tasks/KanbanColumn'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'
import { AISuggestModal } from '@/components/tasks/AISuggestModal'
import { PresenceAvatars } from '@/components/tasks/PresenceAvatars'
import { Skeleton } from '@/components/ui/Skeleton'
import { KANBAN_COLUMNS } from '@/lib/constants'
import type { Task, Project } from '@/lib/types'
import Link from 'next/link'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

export default function ProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dragStartStatus, setDragStartStatus] = useState<string | null>(null)
  const [dragError, setDragError] = useState<string | null>(null)

  // On mobile, disable drag entirely and show tap-to-move UI instead
  const [isMobile, setIsMobile] = useState(false)
  const [movingTask, setMovingTask] = useState<Task | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Only use pointer + keyboard sensors (no TouchSensor — it conflicts with scroll on mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
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

      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      setProject(proj)

      try {
        const data = await getTasks(id as string)
        setTasks(data)
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
        (payload) => setTasks(prev => prev.map(task =>
          task.id === payload.new.id
            ? { ...payload.new, assignee: task.assignee } as Task
            : task
        )))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` },
        (payload) => setTasks(prev => prev.filter(task => task.id !== payload.old.id)))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    const overTask = tasks.find(t => t.id === overId)
    const overColumn = KANBAN_COLUMNS.find(c => c.id === overId)

    if (overColumn) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        const firstTaskInColumn = prev.find(t => t.status === overColumn.id)
        const targetIndex = firstTaskInColumn
          ? prev.findIndex(t => t.id === firstTaskInColumn.id)
          : prev.length
        const updated = [...prev]
        updated[activeIndex] = { ...updated[activeIndex], status: overColumn.id as Task['status'] }
        return arrayMove(updated, activeIndex, targetIndex)
      })
      return
    }

    if (overTask && activeTask.status !== overTask.status) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        const overIndex = prev.findIndex(t => t.id === overId)
        const updated = [...prev]
        updated[activeIndex] = { ...updated[activeIndex], status: overTask.status }
        return arrayMove(updated, activeIndex, overIndex)
      })
      return
    }

    if (overTask && activeTask.status === overTask.status) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        const overIndex = prev.findIndex(t => t.id === overId)
        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active } = event
    setActiveTask(null)

    const draggedTask = tasks.find(t => t.id === active.id)
    if (!draggedTask) return

    const newStatus = draggedTask.status

    if (newStatus !== dragStartStatus) {
      // Optimistic update already applied in handleDragOver.
      // If the API call fails, roll back to the original status.
      const previousTasks = tasks.map(t =>
        t.id === draggedTask.id ? { ...t, status: dragStartStatus as Task['status'] } : t
      )

      try {
        await updateTaskStatus(draggedTask.id, newStatus)
        setDragError(null)
      } catch {
        setTasks(previousTasks)
        setDragError('Failed to move task. Please try again.')
        setTimeout(() => setDragError(null), 3000)
      }
    }

    setDragStartStatus(null)
  }

  // Mobile: tap a task to select it, then tap a column header button to move it
  async function handleMobileMove(targetStatus: Task['status']) {
    if (!movingTask) return
    const originalStatus = movingTask.status
    if (originalStatus === targetStatus) {
      setMovingTask(null)
      return
    }

    setTasks(prev => prev.map(t => t.id === movingTask.id ? { ...t, status: targetStatus } : t))
    setMovingTask(null)

    try {
      await updateTaskStatus(movingTask.id, targetStatus)
      setDragError(null)
    } catch {
      setTasks(prev => prev.map(t => t.id === movingTask.id ? { ...t, status: originalStatus } : t))
      setDragError('Failed to move task. Please try again.')
      setTimeout(() => setDragError(null), 3000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20 mb-3" />
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!project) return <div className="p-8 text-white/40 text-sm">Project not found.</div>

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status)

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="min-w-0">
            <Link href="/projects" className="text-sm text-white/40 hover:text-white/70 mb-2 block transition-colors">
              ← All projects
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">{project.name}</h1>
            {project.description && (
              <p className="text-white/40 mt-1 text-sm line-clamp-2 sm:line-clamp-1">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {userId && <PresenceAvatars projectId={id as string} currentUserId={userId} />}
            <Link href={`/projects/${id}/files`} className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors">
              Files
            </Link>
            <Link href={`/projects/${id}/members`} className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors">
              Members
            </Link>
            <button
              onClick={() => setShowAIModal(true)}
              className="rounded-lg bg-white/5 border border-white/10 text-white/60 px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
            >
              ✨ AI
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-white text-black px-3 py-1.5 text-xs font-medium hover:bg-white/90 transition-colors"
            >
              + New task
            </button>
          </div>
        </div>

        {dragError && (
          <div className="mb-4 px-4 py-2 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm">
            {dragError}
          </div>
        )}

        {/* Mobile: show move-to buttons when a task is selected */}
        {isMobile && movingTask && (
          <div className="mb-4 bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-3">Move &quot;{movingTask.title}&quot; to:</p>
            <div className="flex gap-2">
              {KANBAN_COLUMNS.filter(c => c.id !== movingTask.status).map(col => (
                <button
                  key={col.id}
                  onClick={() => handleMobileMove(col.id as Task['status'])}
                  className="flex-1 rounded-lg bg-white/10 text-white/70 px-3 py-2 text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  {col.title}
                </button>
              ))}
              <button
                onClick={() => setMovingTask(null)}
                className="rounded-lg border border-white/10 text-white/40 px-3 py-2 text-xs hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Desktop: full drag-and-drop kanban. Mobile: stacked list with tap-to-move. */}
        {isMobile ? (
          <div className="space-y-6">
            {KANBAN_COLUMNS.map(col => (
              <div key={col.id}>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
                  {col.title} <span className="text-white/20">({getColumnTasks(col.id).length})</span>
                </h2>
                <div className="space-y-2">
                  {getColumnTasks(col.id).length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-white/20">No tasks</p>
                    </div>
                  )}
                  {getColumnTasks(col.id).map(task => (
                    <div
                      key={task.id}
                      onClick={() => setMovingTask(movingTask?.id === task.id ? null : task)}
                      className={`bg-[#1a1a1a] rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                        movingTask?.id === task.id
                          ? 'border-white/40 bg-white/5'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <p className="text-sm text-white/80">{task.title}</p>
                      {task.priority && (
                        <p className={`text-xs mt-1 ${
                          task.priority === 'high' ? 'text-red-400' :
                          task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>{task.priority}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={({ active }) => {
              const task = tasks.find(t => t.id === active.id)
              if (task) {
                setActiveTask(task)
                setDragStartStatus(task.status)
              }
            }}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-3 gap-4">
              {KANBAN_COLUMNS.map(col => (
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
        )}
      </div>

      {showModal && userId && (
        <NewTaskModal
          projectId={id as string}
          userId={userId}
          onCreated={refreshTasks}
          onClose={() => setShowModal(false)}
        />
      )}

      {showAIModal && userId && (
        <AISuggestModal
          projectId={id as string}
          projectName={project.name}
          projectDescription={project.description}
          userId={userId}
          existingTasks={tasks.map(t => t.title)}
          onCreated={refreshTasks}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  )
}
