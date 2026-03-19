'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signUp(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">Start collaborating with your team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="full_name" name="full_name" label="Full name" type="text"
            placeholder="Jane Smith" required />
          <Input id="email" name="email" label="Email" type="email"
            placeholder="jane@example.com" required />
          <Input id="password" name="password" label="Password" type="password"
            placeholder="Min. 6 characters" minLength={6} required />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" loading={loading}>Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}