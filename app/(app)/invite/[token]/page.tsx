'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function acceptInvite() {
      const supabase = createClient()

      // 1️⃣ Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/invite/${token}`)
        return
      }

      // 2️⃣ Look up the invite by token
      const { data: invite, error: inviteError } = await supabase
        .from('project_invites')
        .select('*')
        .eq('token', token)
        .eq('accepted', false)
        .single()

      if (inviteError || !invite) {
        setStatus('error')
        setMessage('This invite is invalid or has already been used.')
        return
      }

      // 3️⃣ Check if user is already a member
      const { data: existing } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', invite.project_id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        router.push(`/projects/${invite.project_id}`)
        return
      }

      // 4️⃣ Add user to project
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({ project_id: invite.project_id, user_id: user.id, role: 'member' })

      if (memberError) {
        setStatus('error')
        setMessage('Failed to join project. Please try again.')
        return
      }

      // 5️⃣ Mark invite as accepted
      await supabase
        .from('project_invites')
        .update({ accepted: true })
        .eq('token', token)

      setStatus('success')
      setTimeout(() => router.push(`/projects/${invite.project_id}`), 2000)
    }

    acceptInvite()
  }, [token])

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="text-3xl mb-4">⏳</div>
            <h1 className="text-white text-lg font-semibold">Accepting invite...</h1>
            <p className="text-white/40 text-sm mt-2">Just a moment</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-3xl mb-4">🎉</div>
            <h1 className="text-white text-lg font-semibold">You're in!</h1>
            <p className="text-white/40 text-sm mt-2">Redirecting you to the project...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-3xl mb-4">❌</div>
            <h1 className="text-white text-lg font-semibold">Something went wrong</h1>
            <p className="text-white/40 text-sm mt-2">{message}</p>
            <button
              onClick={() => router.push('/projects')}
              className="mt-6 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Go to projects
            </button>
          </>
        )}
      </div>
    </div>
  )
}