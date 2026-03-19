'use client'

import { useState } from 'react'
import { createTask } from '@/lib/services/tasks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="title" label="Task title" type="text"
            placeholder="What needs to be done?" value={title}
            onChange={e => setTitle(e.target.value)} required />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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