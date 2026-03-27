'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

const LOADING_STEPS = [
  'Understanding your idea...',
  'Thinking about your niche...',
  'Crafting your project plan...',
  'Writing your tasks...',
  'Setting priorities and due dates...',
  'Almost ready...',
]

const POSTING_OPTIONS = ['Once a week', 'Twice a week', '3x a week', 'Daily', 'Whenever I feel like it']
const TEAM_OPTIONS = ['Just me', 'Me + 1 friend', 'Small team (3-5)', 'Bigger team (5+)']

type Props = {
  userId: string
  onCreated: () => void
  onClose: () => void
}

export function AIProjectModal({ userId, onCreated, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'prompt' | 'context' | 'loading' | 'review'>('prompt')
  const [prompt, setPrompt] = useState('')
  const [postingFrequency, setPostingFrequency] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<GeneratedProject | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())

  async function handleGenerate() {
    setStep('loading')
    setLoadingStep(0)
    setError(null)

    const interval = setInterval(() => {
      setLoadingStep(prev => prev < LOADING_STEPS.length - 1 ? prev + 1 : prev)
    }, 800)

    try {
      const res = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, postingFrequency, teamSize }),
      })

      const data = await res.json()
      clearInterval(interval)

      if (!res.ok) throw new Error(data.error || 'Failed to generate project')

      setGenerated(data.project)
      setSelectedTasks(new Set(data.project.tasks.map((_: any, i: number) => i)))
      setStep('review')
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message)
      setStep('context')
    }
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

    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: userId,
      role: 'owner',
    })

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
    router.push(`/projects/${project.id}`)
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

          {/* Step 1 — Prompt */}
          {step === 'prompt' && (
            <div className="space-y-4">
              <p className="text-white/40 text-sm">Just describe your idea casually — no need to be formal!</p>
              <div className="space-y-2">
                <p className="text-xs text-white/30 uppercase tracking-wide">Try something like...</p>
                {[
                  'cooking videos with a fun twist for YouTube',
                  'travel vlogs around Southeast Asia on a budget',
                  'funny gaming clips and highlights on YouTube',
                ].map(example => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 hover:text-white/60 transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. cooking videos with a fun twist, travel vlogs in Japan, gaming clips..."
                rows={3}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none placeholder-white/20"
              />
              <p className="text-xs text-white/20">The more specific you are, the better the tasks will be!</p>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={() => setStep('context')}
                disabled={!prompt.trim()}
                className="w-full rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2 — Context questions */}
          {step === 'context' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-white/70 mb-3">How often do you want to post?</p>
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

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('prompt')}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!postingFrequency || !teamSize}
                  className="flex-1 rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  ✨ Generate
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Loading */}
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

          {/* Step 4 — Review */}
          {step === 'review' && generated && (
            <div className="space-y-4">
              <div className="bg-[#2a2a2a] rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{CATEGORY_LABELS[generated.category]}</span>
                </div>
                <h3 className="text-white font-semibold">{generated.name}</h3>
                <p className="text-white/40 text-sm mt-1">{generated.description}</p>
              </div>

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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80">{task.title}</p>
                          <p className="text-xs text-white/30">Due {due.toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 'review' && generated && (
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 flex-shrink-0">
            <button
              onClick={() => { setGenerated(null); setStep('prompt'); setError(null) }}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Start over
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || selectedTasks.size === 0}
              className="flex-1 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create project'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}