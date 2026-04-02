'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Task } from '@/lib/types'

type Props = {
  id: string
  title: string
  tasks: Task[]
  projectId: string
  onUpdated: () => void
}

export function KanbanColumn({ id, title, tasks, projectId, onUpdated }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div>
      <h2 className="text-xs font-medium text-white/30 uppercase tracking-wide mb-3 flex items-center gap-2">
        {title}
        <span className="bg-white/10 text-white/50 rounded-full px-2 py-0.5 text-xs">
          {tasks.length}
        </span>
      </h2>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[100px] rounded-xl p-2 transition-colors ${isOver ? 'bg-white/5' : ''}`}
      >
        <SortableContext items={[id, ...tasks.map(t => t.id)]} strategy={verticalListSortingStrategy}>
  {tasks.length === 0 ? (
    <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-white/10">
      <p className="text-xs text-white/20">No tasks</p>
    </div>
  ) : (
    tasks.map(task => (
      <TaskCard key={task.id} task={task} projectId={projectId} onUpdated={onUpdated} />
    ))
  )}
</SortableContext>
      </div>
    </div>
  )
}