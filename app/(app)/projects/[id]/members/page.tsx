'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MemberList } from '@/components/members/MemberList'
import { InviteModal } from '@/components/members/InviteModal'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

export default function MembersPage() {
  const { id } = useParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href={`/projects/${id}`} className="text-sm text-white/40 hover:text-white/70 mb-2 block transition-colors">
              ← Back to project
            </Link>
            <h1 className="text-2xl font-semibold text-white">Members</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-white text-black px-4 py-3 text-sm font-medium hover:bg-white/90 transition-colors min-h-[44px] sm:self-end"
          >
            Invite member
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          userId && (
            <MemberList
              key={refresh}
              projectId={id as string}
              currentUserId={userId}
            />
          )
        )}
      </div>

      {showModal && (
        <InviteModal
          projectId={id as string}
          onInvited={() => setRefresh(r => r + 1)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
