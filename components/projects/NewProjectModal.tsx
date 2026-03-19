'use client'

import { useState } from 'react'
import { createProject } from '@/lib/services/projects'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Props = {
  userId: string
  onCreated: () => void
  onClose: () => void
}

export function NewProjectModal({ userId, onCreated, onClose }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createProject(name, description, userId)
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Project name" type="text"
            placeholder="My awesome project" value={name}
            onChange={e => setName(e.target.value)} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <div className="flex-1">
              <Button type="submit" loading={loading}>Create project</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}