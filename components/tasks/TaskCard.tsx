import { updateTaskStatus, deleteTask } from '@/lib/services/tasks'

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
  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateTaskStatus(task.id, e.target.value as any)
    onUpdated()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    await deleteTask(task.id)
    onUpdated()
  }

  return (
    <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all group">
      <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-white/20' : 'text-white/80'}`}>
        {task.title}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={task.status}
          onChange={handleStatusChange}
          style={{ backgroundColor: '#2a2a2a', color: '#fff' }}
          className="text-xs border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/20"
        >
          <option value="todo" style={{ backgroundColor: '#2a2a2a', color: '#fff' }}>To do</option>
          <option value="in_progress" style={{ backgroundColor: '#2a2a2a', color: '#fff' }}>In progress</option>
          <option value="done" style={{ backgroundColor: '#2a2a2a', color: '#fff' }}>Done</option>
        </select>
        <button
          onClick={handleDelete}
          className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}