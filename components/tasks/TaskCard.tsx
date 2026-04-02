'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskDetailModal } from './TaskDetailModal'
import { PRIORITY_BADGE_COLORS } from '@/lib/constants'
import type { Task } from '@/lib/types'

type Props = {
  task: Task
  projectId: string
  onUpdated: () => void
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

  const assigneeInitial = task.assignee
    ? (task.assignee.full_name || task.assignee.email || '?')[0].toUpperCase()
    : null

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center justify-between bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <p
              onPointerDown={e => e.stopPropagation()}
              onClick={() => setShowDetail(true)}
              className={`text-sm cursor-pointer hover:text-white transition-colors truncate ${task.status === 'done' ? 'line-through text-white/20' : 'text-white/80'}`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {task.priority && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITY_BADGE_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
              )}
              {task.due_date && (() => {
                const due = new Date(task.due_date!)
                const now = new Date()
                const isOverdue = due < now && task.status !== 'done'
                const isDueSoon = !isOverdue && due.getTime() - now.getTime() < 1000 * 60 * 60 * 24 * 2

                return (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isOverdue
                      ? 'bg-red-400/10 text-red-400'
                      : isDueSoon
                      ? 'bg-yellow-400/10 text-yellow-400'
                      : 'text-white/30'
                  }`}>
                    {isOverdue ? '⚠ ' : ''}{due.toLocaleDateString()}
                  </span>
                )
              })()}
            </div>
          </div>
          {assigneeInitial && (
            <div
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/60 flex-shrink-0"
              title={task.assignee?.full_name || task.assignee?.email}
            >
              {assigneeInitial}
            </div>
          )}
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