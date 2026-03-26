'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskDetailModal } from './TaskDetailModal'

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
  task: Task
  projectId: string
  onUpdated: () => void
}

const PRIORITY_COLORS = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-yellow-400/10 text-yellow-400',
  high: 'bg-red-400/10 text-red-400',
}

export function TaskCard({ task, projectId, onUpdated }: Props) {
  const [showDetail, setShowDetail] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all group"
      >
        <div className="flex items-center gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors"
          >
            ⠿
          </button>
          <div className="flex-1 min-w-0">
            <p
              onClick={() => setShowDetail(true)}
              className={`text-sm cursor-pointer hover:text-white transition-colors truncate ${task.status === 'done' ? 'line-through text-white/20' : 'text-white/80'}`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {task.priority && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
              )}
              {task.due_date && (
                <span className="text-xs text-white/30">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal
          task={task}
          projectId={projectId}
          onUpdated={onUpdated}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}