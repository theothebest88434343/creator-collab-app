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
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-8">
          Built for creative teams
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight mb-6">
          Your team's work,<br />
          <span className="text-white/40">all in one place.</span>
        </h1>
        <p className="text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
          Collab helps small creative teams manage projects, track tasks, share files, and stay in sync — without the complexity.
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

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 py-20 border-t border-white/5">
        <h2 className="text-2xl font-semibold text-center mb-16">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">1</div>
            <h3 className="font-medium text-white mb-2">Create a project</h3>
            <p className="text-sm text-white/40 leading-relaxed">Set up a project for your team in seconds. No setup, no complexity.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">2</div>
            <h3 className="font-medium text-white mb-2">Invite your team</h3>
            <p className="text-sm text-white/40 leading-relaxed">Add collaborators by email. Everyone gets access to tasks and files instantly.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium mx-auto mb-4">3</div>
            <h3 className="font-medium text-white mb-2">Get work done</h3>
            <p className="text-sm text-white/40 leading-relaxed">Track tasks on a kanban board, upload files, and keep your team moving.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-8 py-20 text-center border-t border-white/5">
        <h2 className="text-3xl font-semibold mb-4">Ready to get started?</h2>
        <p className="text-white/40 mb-8">Join teams already using Collab to ship faster.</p>
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