'use client'

import { useState } from 'react'
import { createTask } from '@/lib/services/tasks'

type SuggestedTask = {
  title: string
  priority: 'low' | 'medium' | 'high'
  due_days: number
}

type Props = {
  projectId: string
  projectName: string
  projectDescription: string | null
  userId: string
  existingTasks: string[]
  onCreated: () => void
  onClose: () => void
}

const PRIORITY_COLORS = {
  low: 'bg-green-400/10 text-green-400',
  medium: 'bg-yellow-400/10 text-yellow-400',
  high: 'bg-red-400/10 text-red-400',
}

export function AISuggestModal({
  projectId,
  projectName,
  projectDescription,
  userId,
  existingTasks,
  onCreated,
  onClose,
}: Props) {
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, projectDescription, existingTasks }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate suggestions')

      setSuggestions(data.tasks)
      setSelected(new Set(data.tasks.map((_: any, i: number) => i)))
      setGenerated(true)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  function toggleSelect(index: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  async function handleAddTasks() {
    setAdding(true)
    const selectedTasks = suggestions.filter((_, i) => selected.has(i))

    for (const task of selectedTasks) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + task.due_days)

      await fetch('/api/ai/create-suggested-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId,
          title: task.title,
          priority: task.priority,
          dueDate: dueDate.toISOString(),
        }),
      })
    }

    onCreated()
    onClose()
    setAdding(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="text-white font-semibold text-lg">AI Task Suggestions</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>
        <p className="text-white/40 text-sm mb-6">
          Generate smart task suggestions based on your project details.
        </p>

        {!generated ? (
          <div className="text-center py-6">
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-lg bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Generating...
                </span>
              ) : '✨ Generate suggestions'}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
              {suggestions.map((task, i) => {
                const due = new Date()
                due.setDate(due.getDate() + task.due_days)
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      selected.has(i)
                        ? 'border-white/20 bg-white/5'
                        : 'border-white/5 bg-transparent opacity-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      selected.has(i) ? 'bg-white border-white' : 'border-white/20'
                    }`}>
                      {selected.has(i) && <span className="text-black text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80">{task.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">Due {due.toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                ↺ Regenerate
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTasks}
                  disabled={adding || selected.size === 0}
                  className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {adding ? 'Adding...' : `Add ${selected.size} task${selected.size !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}