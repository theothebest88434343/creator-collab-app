import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <span className="font-semibold text-lg tracking-tight">Collab.</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-8">
          ✨ AI-powered project management for creators
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight mb-6">
          Stop guessing.<br />
          <span className="text-white/40">Start creating.</span>
        </h1>
        <p className="text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
          Collab helps content creators and small teams manage projects, track tasks, and stay in sync — with AI that actually understands your workflow.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="rounded-lg bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors">
            Get started for free
          </Link>
          <Link href="/login" className="rounded-lg border border-white/10 px-6 py-3 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors">
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-20 border-t border-white/5">
        <h2 className="text-2xl font-semibold text-center mb-4">Everything your team needs</h2>
        <p className="text-white/40 text-center text-sm mb-16 max-w-xl mx-auto">Built specifically for content creators, YouTubers, podcasters, and small creative teams.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
            <div className="text-2xl mb-4">✨</div>
            <h3 className="font-medium text-white mb-2">AI Project Generator</h3>
            <p className="text-sm text-white/40 leading-relaxed">Describe your idea casually and AI generates a full project plan with tasks, priorities, and due dates instantly.</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
            <div className="text-2xl mb-4">📋</div>
            <h3 className="font-medium text-white mb-2">Kanban Board</h3>
            <p className="text-sm text-white/40 leading-relaxed">Drag and drop tasks between To Do, In Progress, and Done. See your whole project at a glance.</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
            <div className="text-2xl mb-4">👥</div>
            <h3 className="font-medium text-white mb-2">Team Collaboration</h3>
            <p className="text-sm text-white/40 leading-relaxed">Invite teammates by email, assign tasks, leave comments, and see who's viewing your project in real time.</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
            <div className="text-2xl mb-4">🔔</div>
            <h3 className="font-medium text-white mb-2">Smart Notifications</h3>
            <p className="text-sm text-white/40 leading-relaxed">Get notified when you're assigned a task, added to a project, or when task statuses change.</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
            <div className="text-2xl mb-4">📁</div>
            <h3 className="font-medium text-white mb-2">File Management</h3>
            <p className="text-sm text-white/40 leading-relaxed">Upload, preview, and share files directly inside your projects. Images and PDFs preview instantly.</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="font-medium text-white mb-2">Dashboard</h3>
            <p className="text-sm text-white/40 leading-relaxed">See all your tasks, overdue items, unassigned work, and recent activity across all projects in one place.</p>
          </div>
        </div>
      </section>

      {/* AI highlight */}
      <section className="max-w-4xl mx-auto px-8 py-20 border-t border-white/5">
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-10 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-2xl font-semibold mb-4">Built for real creators</h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8 leading-relaxed">
            Just type something like <span className="text-white/70">"cooking videos with a fun twist"</span> and Collab generates a full project plan with creator-specific tasks like "film this week's recipe", "edit Monday's video", and "design thumbnail" — not generic business jargon.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {['🎬 YouTube', '🎙️ Podcast', '📱 Short Form', '🎨 Design', '📣 Marketing', '📁 Other'].map(cat => (
              <div key={cat} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50">
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 py-20 border-t border-white/5">
        <h2 className="text-2xl font-semibold text-center mb-16">Get started in 3 steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">1</div>
            <h3 className="font-medium text-white mb-2">Describe your idea</h3>
            <p className="text-sm text-white/40 leading-relaxed">Type your project idea casually. AI generates a complete plan with tasks and due dates tailored to your niche.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">2</div>
            <h3 className="font-medium text-white mb-2">Invite your team</h3>
            <p className="text-sm text-white/40 leading-relaxed">Add collaborators by email. Everyone gets access to tasks, files, and real-time updates instantly.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">3</div>
            <h3 className="font-medium text-white mb-2">Get work done</h3>
            <p className="text-sm text-white/40 leading-relaxed">Track tasks on a kanban board, upload files, comment on tasks, and keep your team moving.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-8 py-20 text-center border-t border-white/5">
        <h2 className="text-3xl font-semibold mb-4">Ready to get organized?</h2>
        <p className="text-white/40 mb-8">Join creators already using Collab to manage their projects smarter.</p>
        <Link href="/signup" className="rounded-lg bg-white text-black px-8 py-3 text-sm font-medium hover:bg-white/90 transition-colors">
          Create your free account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 text-center">
        <span className="text-sm text-white/20">© 2026 Collab. Built by Theo Steinstrasser.</span>
      </footer>

    </div>
  )
}