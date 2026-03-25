'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '../actions'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signUp(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="w-full max-w-sm text-center">
          <span className="text-white font-semibold text-2xl tracking-tight">Collab.</span>
          <div className="mt-8 bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
            <h2 className="text-white font-medium mb-2">Check your email</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              We sent a confirmation link to <span className="text-white/60">{email}</span>. Click the link to activate your account.
            </p>
          </div>
          <p className="mt-6 text-sm text-white/30">
            Already confirmed?{' '}
            <Link href="/login" className="font-medium text-white/60 hover:text-white transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-white font-semibold text-2xl tracking-tight">Collab.</span>
          <p className="mt-3 text-sm text-white/40">Get started for free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/50 mb-1">Full name</label>
            <input
              id="full_name" name="full_name" type="text"
              placeholder="Full Name" required
              className="block w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/50 mb-1">Email</label>
            <input
              id="email" name="email" type="email"
              placeholder="Email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="block w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/50 mb-1">Password</label>
            <input
              id="password" name="password" type="password"
              placeholder="Min. 6 characters" minLength={6} required
              className="block w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-white/60 hover:text-white transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}