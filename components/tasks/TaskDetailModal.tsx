'use client'

import { useState, useEffect } from 'react'
import { updateTask, deleteTask } from '@/lib/services/tasks'
import { getMembers } from '@/lib/services/members'

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

type Member = {
  user_id: string
  user: { id: string; full_name: string; email: string }
}

type Props = {
  task: Task
  projectId: string
  onUpdated: () => void
  onClose: () => void
}

const PRIORITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

export function TaskDetailModal({ task, projectId, onUpdated, onClose }: Props) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [assigneeId, setAssigneeId] = useState(task.assignee_id || '')
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [members, setMembers] = useState<Member[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMembers(projectId).then(data => setMembers(data as Member[]))
  }, [projectId])

  async function handleSave() {
    setSaving(true)
    await updateTask(task.id, {
      title,
      description: description || undefined,
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
      priority: priority as 'low' | 'medium' | 'high',
    })
    onUpdated()
    setSaving(false)
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    await deleteTask(task.id)
    onUpdated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Task details</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className={`w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 ${PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}`}
              >
                <option value="low" className="text-green-400">Low</option>
                <option value="medium" className="text-yellow-400">Medium</option>
                <option value="high" className="text-red-400">High</option>
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Assignee</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.user.id} value={m.user.id}>{m.user.full_name || m.user.email}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Delete task
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}