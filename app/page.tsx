'use client'

import Link from 'next/link'
import { useEffect } from 'react'

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  useScrollAnimation()

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <style>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-animate-delay-1 { transition-delay: 0.1s; }
        .scroll-animate-delay-2 { transition-delay: 0.2s; }
        .scroll-animate-delay-3 { transition-delay: 0.3s; }
        .scroll-animate-delay-4 { transition-delay: 0.4s; }
        .scroll-animate-delay-5 { transition-delay: 0.5s; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/5">
        <span className="font-semibold text-lg tracking-tight">Collab.</span>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="rounded-lg bg-white text-black px-3 sm:px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
        <div className="scroll-animate inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6 sm:mb-8">
          ✨ AI-powered project management for creators
        </div>
        <h1 className="scroll-animate scroll-animate-delay-1 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-5 sm:mb-6" style={{ lineHeight: '1.15' }}>
          Stop guessing.<br />
          <span className="text-white/40">Start creating.</span>
        </h1>
        <p className="scroll-animate scroll-animate-delay-2 text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Collab helps content creators and small teams manage projects, track tasks, and stay in sync — with AI that actually understands your workflow.
        </p>
        <div className="scroll-animate scroll-animate-delay-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link href="/signup" className="rounded-lg bg-white text-black px-5 sm:px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors">
            Get started for free
          </Link>
          <Link href="/login" className="rounded-lg border border-white/10 px-5 sm:px-6 py-3 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors">
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-white/5">
        <h2 className="scroll-animate text-2xl font-semibold text-center mb-4">Everything your team needs</h2>
        <p className="scroll-animate scroll-animate-delay-1 text-white/40 text-center text-sm mb-12 sm:mb-16 max-w-xl mx-auto">Built specifically for content creators, YouTubers, podcasters, and small creative teams.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '✨', title: 'AI Project Generator', desc: 'Describe your idea casually and AI generates a full project plan with tasks, priorities, and due dates instantly.' },
            { icon: '📋', title: 'Kanban Board', desc: 'Drag and drop tasks between To Do, In Progress, and Done. See your whole project at a glance.' },
            { icon: '👥', title: 'Team Collaboration', desc: 'Invite teammates by email, assign tasks, leave comments, and see who\'s viewing your project in real time.' },
            { icon: '🔔', title: 'Smart Notifications', desc: 'Get notified when you\'re assigned a task, added to a project, or when task statuses change.' },
            { icon: '📁', title: 'File Management', desc: 'Upload, preview, and share files directly inside your projects. Images and PDFs preview instantly.' },
            { icon: '📊', title: 'Dashboard', desc: 'See all your tasks, overdue items, unassigned work, and recent activity across all projects in one place.' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className={`scroll-animate scroll-animate-delay-${i % 3 + 1} bg-[#1a1a1a] rounded-2xl border border-white/5 p-5 sm:p-6 hover:border-white/10 transition-colors`}
            >
              <div className="text-2xl mb-4">{feature.icon}</div>
              <h3 className="font-medium text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI highlight */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-white/5">
        <div className="scroll-animate bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 sm:p-10 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-2xl font-semibold mb-4">Built for real creators</h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8 leading-relaxed text-sm sm:text-base">
            Just type something like <span className="text-white/70">"cooking videos with a fun twist"</span> and Collab generates a full project plan with creator-specific tasks like "film this week's recipe", "edit Monday's video", and "design thumbnail" — not generic business jargon.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
            {['🎬 YouTube', '🎙️ Podcast', '📱 Short Form', '🎨 Design', '📣 Marketing', '📁 Other'].map(cat => (
              <div key={cat} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50">
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-white/5">
        <h2 className="scroll-animate text-2xl font-semibold text-center mb-12 sm:mb-16">Get started in 3 steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8">
          {[
            { step: '1', title: 'Describe your idea', desc: 'Type your project idea casually. AI generates a complete plan with tasks and due dates tailored to your niche.' },
            { step: '2', title: 'Invite your team', desc: 'Add collaborators by email. Everyone gets access to tasks, files, and real-time updates instantly.' },
            { step: '3', title: 'Get work done', desc: 'Track tasks on a kanban board, upload files, comment on tasks, and keep your team moving.' },
          ].map((item, i) => (
            <div key={item.step} className={`scroll-animate scroll-animate-delay-${i + 1} text-center`}>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">{item.step}</div>
              <h3 className="font-medium text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center border-t border-white/5">
        <h2 className="scroll-animate text-2xl sm:text-3xl font-semibold mb-4">Ready to get organized?</h2>
        <p className="scroll-animate scroll-animate-delay-1 text-white/40 mb-8 text-sm sm:text-base">Join creators already using Collab to manage their projects smarter.</p>
        <div className="scroll-animate scroll-animate-delay-2">
          <Link href="/signup" className="rounded-lg bg-white text-black px-6 sm:px-8 py-3 text-sm font-medium hover:bg-white/90 transition-colors">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 sm:px-8 py-6 text-center">
        <span className="text-sm text-white/20">© 2026 Collab. Built by Theo Steinstrasser.</span>
      </footer>
    </div>
  )
}
