'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORY_OPTIONS = [
  { id: 'youtube', label: '🎬 YouTube', desc: 'Videos, shorts, live streams' },
  { id: 'podcast', label: '🎙️ Podcast', desc: 'Audio shows and episodes' },
  { id: 'short_form', label: '📱 Short Form', desc: 'TikTok, Reels, Shorts' },
  { id: 'design', label: '🎨 Design', desc: 'Graphics, branding, UI' },
  { id: 'marketing', label: '📣 Marketing', desc: 'Campaigns and content' },
  { id: 'other', label: '📁 Other', desc: 'Something else entirely' },
]

type Props = {
  userId: string
  onComplete: () => void
}

export function OnboardingModal({ userId, onComplete }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSaveName() {
    if (!name.trim()) { setStep(3); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ full_name: name }).eq('id', userId)
    setSaving(false)
    setStep(3)
  }

  async function handleFinish(useAI: boolean) {
    onComplete()
    if (useAI) {
      router.push('/projects?ai=true')
    } else {
      router.push('/projects?new=true')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8">

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="text-5xl mb-2">👋</div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Collab.</h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Your AI-powered project manager built for creators. Let's get you set up in under a minute.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { icon: '✨', text: 'AI generates your project plan' },
                  { icon: '📋', text: 'Kanban board for your tasks' },
                  { icon: '👥', text: 'Invite your team' },
                  { icon: '📊', text: 'Dashboard to track everything' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span>{item.icon}</span>
                    <span className="text-xs text-white/60">{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Let's go →
              </button>
            </div>
          )}

          {/* Step 2 — Name */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">What's your name?</h2>
                <p className="text-white/40 text-sm">So your teammates know who you are.</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 placeholder-white/20"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Content type */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">What do you create?</h2>
                <p className="text-white/40 text-sm">This helps AI generate better tasks for you.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setCategory(option.id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${
                      category === option.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-transparent border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{option.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{option.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!category}
                  className="flex-1 rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Create first project */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="text-5xl mb-2">🚀</div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">You're all set!</h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Ready to create your first project? Let AI do the heavy lifting or start from scratch.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleFinish(true)}
                  className="w-full bg-white text-black rounded-xl px-4 py-4 text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <div className="text-left">
                      <p className="font-semibold">Generate with AI</p>
                      <p className="text-xs text-black/50 font-normal">Describe your idea and AI creates your project</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleFinish(false)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 text-sm hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>📝</span>
                    <div className="text-left">
                      <p className="font-medium">Start manually</p>
                      <p className="text-xs text-white/40 font-normal">Create a project from scratch</p>
                    </div>
                  </div>
                </button>
              </div>
              <button
                onClick={onComplete}
                className="text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}