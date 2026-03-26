'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [initial, setInitial] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setFullName(profile.full_name)
        setInitial(profile.full_name[0].toUpperCase())
      } else {
        setInitial((user.email || '?')[0].toUpperCase())
      }
    }
    load()
  }, [])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      setProfileMessage({ type: 'error', text: 'Failed to update profile.' })
    } else {
      setProfileMessage({ type: 'success', text: 'Profile updated!' })
      setInitial(fullName[0]?.toUpperCase() || '?')
    }
    setProfileLoading(false)
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      setPasswordLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message })
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-white mb-8">Settings</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-semibold text-white/60">
            {initial}
          </div>
          <div>
            <p className="text-white font-medium">{fullName || 'No name set'}</p>
            <p className="text-white/40 text-sm">{email}</p>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 mb-4">
          <h2 className="text-white font-semibold mb-4">Profile</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white/40 text-sm cursor-not-allowed"
              />
            </div>
            {profileMessage && (
              <p className={`text-sm px-3 py-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                {profileMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-semibold mb-4">Change password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                placeholder="New password"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                placeholder="Confirm new password"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm px-3 py-2 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                {passwordMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}