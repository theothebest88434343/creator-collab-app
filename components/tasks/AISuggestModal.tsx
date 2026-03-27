'use client'

import { useState } from 'react'

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

const POSTING_OPTIONS = ['Once a week', 'Twice a week', '3x a week', 'Daily', 'Whenever I feel like it']
const TEAM_OPTIONS = ['Just me', 'Me + 1 friend', 'Small team (3-5)', 'Bigger team (5+)']

const LOADING_STEPS = [
  'Looking at your project...',
  'Thinking of ideas...',
  'Writing your tasks...',
  'Almost done...',
]

export function AISuggestModal({
  projectId,
  projectName,
  projectDescription,
  userId,
  existingTasks,
  onCreated,
  onClose,
}: Props) {
  const [step, setStep] = useState<'context' | 'loading' | 'review'>('context')
  const [postingFrequency, setPostingFrequency] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loadingStep, setLoadingStep] = useState(0)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setStep('loading')
    setLoadingStep(0)
    setError(null)

    const interval = setInterval(() => {
      setLoadingStep(prev => prev < LOADING_STEPS.length - 1 ? prev + 1 : prev)
    }, 700)

    try {
      const res = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          projectDescription,
          existingTasks,
          postingFrequency,
          teamSize,
        }),
      })

      const data = await res.json()
      clearInterval(interval)

      if (!res.ok) throw new Error(data.error || 'Failed to generate suggestions')

      setSuggestions(data.tasks)
      setSelected(new Set(data.tasks.map((_: any, i: number) => i)))
      setStep('review')
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message)
      setStep('context')
    }
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
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="text-white font-semibold text-lg">AI Task Suggestions</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Step 1 — Context */}
          {step === 'context' && (
            <div className="space-y-6">
              <p className="text-white/40 text-sm">Help the AI understand your project a bit better.</p>

              <div>
                <p className="text-sm font-medium text-white/70 mb-3">How often do you post?</p>
                <div className="grid grid-cols-2 gap-2">
                  {POSTING_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setPostingFrequency(option)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        postingFrequency === option
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white/70 mb-3">Who's working on this?</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEAM_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setTeamSize(option)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        teamSize === option
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={!postingFrequency || !teamSize}
                className="w-full rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                ✨ Generate suggestions
              </button>
            </div>
          )}

          {/* Step 2 — Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-white font-medium">{LOADING_STEPS[loadingStep]}</p>
                <div className="flex items-center justify-center gap-1">
                  {LOADING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i <= loadingStep ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 'review' && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-3">
                {selected.size} task{selected.size !== 1 ? 's' : ''} selected
              </p>
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
          )}
        </div>

        {step === 'review' && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => { setStep('context'); setError(null) }}
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
        )}
      </div>
    </div>
  )
}