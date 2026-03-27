'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type GeneratedProject = {
  name: string
  description: string
  category: string
  tasks: { title: string; priority: 'low' | 'medium' | 'high'; due_days: number }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  youtube: '🎬 YouTube',
  podcast: '🎙️ Podcast',
  social_media: '📱 Social Media',
  design: '🎨 Design',
  marketing: '📣 Marketing',
  other: '📁 Other',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-yellow-400/10 text-yellow-400',
  high: 'bg-red-400/10 text-red-400',
}

type Props = {
  userId: string
  onCreated: () => void
  onClose: () => void
}

export function AIProjectModal({ userId, onCreated, onClose }: Props) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<GeneratedProject | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate project')

      setGenerated(data.project)
      setSelectedTasks(new Set(data.project.tasks.map((_: any, i: number) => i)))
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  function toggleTask(index: number) {
    setSelectedTasks(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  async function handleCreate() {
    if (!generated) return
    setCreating(true)

    const supabase = createClient()

    const categoryLabel = CATEGORY_LABELS[generated.category] || ''
    const fullDescription = categoryLabel
      ? `[${categoryLabel}] ${generated.description}`
      : generated.description

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({ name: generated.name, description: fullDescription, owner_id: userId })
      .select()
      .single()

    if (projectError || !project) {
      setError('Failed to create project.')
      setCreating(false)
      return
    }

    // Add user as owner
    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: userId,
      role: 'owner',
    })

    // Create selected tasks
    const selectedTaskList = generated.tasks.filter((_, i) => selectedTasks.has(i))
    for (const task of selectedTaskList) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + task.due_days)

      await supabase.from('tasks').insert({
        project_id: project.id,
        created_by: userId,
        title: task.title,
        priority: task.priority,
        due_date: dueDate.toISOString(),
        status: 'todo',
      })
    }

    onCreated()
    onClose()
    setCreating(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <h2 className="text-white font-semibold text-lg">AI Project Generator</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!generated ? (
            <div className="space-y-4">
              <p className="text-white/40 text-sm">Describe your project idea and AI will generate a complete plan with tasks.</p>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. I want to start a YouTube channel about cooking Italian food for beginners..."
                rows={4}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none placeholder-white/20"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? '✨ Generating...' : '✨ Generate project'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Project preview */}
              <div className="bg-[#2a2a2a] rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{CATEGORY_LABELS[generated.category]}</span>
                </div>
                <h3 className="text-white font-semibold">{generated.name}</h3>
                <p className="text-white/40 text-sm mt-1">{generated.description}</p>
              </div>

              {/* Tasks */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                  Tasks ({selectedTasks.size} selected)
                </p>
                <div className="space-y-2">
                  {generated.tasks.map((task, i) => {
                    const due = new Date()
                    due.setDate(due.getDate() + task.due_days)
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTask(i)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedTasks.has(i)
                            ? 'border-white/20 bg-white/5'
                            : 'border-white/5 opacity-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedTasks.has(i) ? 'bg-white border-white' : 'border-white/20'
                        }`}>
                          {selectedTasks.has(i) && <span className="text-black text-xs">✓</span>}
                        </div>
                        <p className="text-sm text-white/80 flex-1">{task.title}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          )}
        </div>

        {generated && (
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 flex-shrink-0">
            <button
              onClick={() => { setGenerated(null); setError(null) }}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Regenerate
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || selectedTasks.size === 0}
              className="flex-1 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : `Create project`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}