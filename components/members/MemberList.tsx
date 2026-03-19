'use client'

import { useEffect, useState } from 'react'
import { getMembers, removeMember } from '@/lib/services/members'

type Props = {
  projectId: string
  currentUserId: string
}

export function MemberList({ projectId, currentUserId }: Props) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [projectId])

  async function load() {
    const data = await getMembers(projectId)
    setMembers(data)
    setLoading(false)
  }

  async function handleRemove(userId: string) {
    await removeMember(projectId, userId)
    load()
  }

  if (loading) return <p className="text-sm text-white/40">Loading members...</p>

  return (
    <div className="space-y-2">
      {members.map(member => (
        <div key={member.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/60">
              {(member.user.full_name || member.user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{member.user.full_name || 'Unnamed'}</p>
              <p className="text-xs text-white/30">{member.user.email} · {member.role}</p>
            </div>
          </div>
          {member.user.id !== currentUserId && (
            <button
              onClick={() => handleRemove(member.user.id)}
              className="text-xs text-red-400/60 hover:text-red-400 font-medium transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  )
}