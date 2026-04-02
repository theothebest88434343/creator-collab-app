import type { TaskPriority } from '@/lib/types'

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

export const PRIORITY_BADGE_COLORS: Record<TaskPriority, string> = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-yellow-400/10 text-yellow-400',
  high: 'bg-red-400/10 text-red-400',
}

export const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'in_progress', title: 'In progress' },
  { id: 'done', title: 'Done' },
] as const
