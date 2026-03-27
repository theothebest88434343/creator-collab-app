'use client'

import { useState } from 'react'
import { createProject } from '@/lib/services/projects'
import { Button } from '@/components/ui/Button'

type Props = {
  userId: string
  onCreated: () => void
  onClose: () => void
}

const CATEGORIES = [
  { id: 'youtube', label: '🎬 YouTube' },
  { id: 'podcast', label: '🎙️ Podcast' },
  { id: 'short_form', label: '📱 Short Form' },
  { id: 'design', label: '🎨 Design' },
  { id: 'marketing', label: '📣 Marketing' },
  { id: 'other', label: '📁 Other' },
]

export function NewProjectModal({ userId, onCreated, onClose }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const fullDescription = category
        ? `[${CATEGORIES.find(c => c.id === category)?.label}] ${description}`
        : description
      await createProject(name, fullDescription, userId)
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">New project</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Project name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My awesome project"
              required
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id === category ? '' : cat.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    category === cat.id
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder-white/20 resize-none"
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
              <Button type="submit" loading={loading}>Create project</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}