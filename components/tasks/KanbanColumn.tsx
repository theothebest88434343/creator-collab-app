'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'

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
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} projectId={projectId} onUpdated={onUpdated} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}