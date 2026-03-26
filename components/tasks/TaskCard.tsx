'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { deleteTask } from '@/lib/services/tasks'

type Task = {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
}

type Props = {
  task: Task
  onUpdated: () => void
}

export function TaskCard({ task, onUpdated }: Props) {
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

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    await deleteTask(task.id)
    onUpdated()
  }

  return (
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
        <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-white/20' : 'text-white/80'}`}>
          {task.title}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs ml-2"
      >
        ✕
      </button>
    </div>
  )
}