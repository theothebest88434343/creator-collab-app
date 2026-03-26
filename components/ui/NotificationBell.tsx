'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
  project_id: string | null
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    loadNotifications()

    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadNotifications() {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  async function markAllRead() {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors w-full"
      >
        <span className="text-base">🔔</span>
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="ml-auto bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full bottom-0 ml-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-2xl mb-2">🔕</p>
                <p className="text-sm text-white/30">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/5' : ''}`}
                >
                  <p className="text-sm text-white/70">{n.message}</p>
                  <p className="text-xs text-white/30 mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                  {!n.read && (
                    <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}