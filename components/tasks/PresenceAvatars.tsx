'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PresenceUser = {
  userId: string
  fullName: string
  initial: string
}

export function PresenceAvatars({ projectId, currentUserId }: { projectId: string; currentUserId: string }) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    const supabase = createClient()
    let fullName = ''
    let initial = ''

    async function setup() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      fullName = profile?.full_name || profile?.email || 'Unknown'
      initial = fullName[0].toUpperCase()

      const channel = supabase.channel(`presence:${projectId}`, {
        config: { presence: { key: user.id } }
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<{ fullName: string; initial: string }>()
          const users = Object.entries(state).map(([userId, presences]) => ({
            userId,
            fullName: presences[0].fullName,
            initial: presences[0].initial,
          })).filter(u => u.userId !== currentUserId)
          setOnlineUsers(users)
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ fullName, initial })
          }
        })

      return channel
    }

    let channelRef: any
    setup().then(ch => { channelRef = ch })

    return () => {
      if (channelRef) supabase.removeChannel(channelRef)
    }
  }, [projectId, currentUserId])

  if (onlineUsers.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {onlineUsers.slice(0, 4).map(user => (
        <div
          key={user.userId}
          title={`${user.fullName} is viewing`}
          className="relative w-7 h-7 rounded-full bg-white/10 border-2 border-[#0f0f0f] flex items-center justify-center text-xs font-medium text-white/70"
        >
          {user.initial}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f0f0f]" />
        </div>
      ))}
      {onlineUsers.length > 4 && (
        <span className="text-xs text-white/30 ml-1">+{onlineUsers.length - 4} more</span>
      )}
    </div>
  )
}