'use client'

import { useState } from 'react'
import { createTask } from '@/lib/services/tasks'
import { Button } from '@/components/ui/Button'

type Props = {
  projectId: string
  userId: string
  onCreated: () => void
  onClose: () => void
}

export function NewTaskModal({ projectId, userId, onCreated, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createTask(projectId, title, userId)
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New task</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Task title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder-white/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex-1">
              <Button type="submit" loading={loading}>Add task</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}