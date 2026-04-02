'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileUpload } from '@/components/files/FileUpload'
import { FileList } from '@/components/files/FileList'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

export default function FilesPage() {
  const { id } = useParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
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
        <div className="mb-8">
          <Link href={`/projects/${id}`} className="text-sm text-white/40 hover:text-white/70 mb-2 block transition-colors">
            ← Back to project
          </Link>
          <h1 className="text-2xl font-semibold text-white">Files</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            {userId && (
              <div className="mb-6 bg-[#1a1a1a] rounded-xl border border-white/5 px-4 sm:px-5 py-4">
                <FileUpload
                  projectId={id as string}
                  userId={userId}
                  onUploaded={() => setRefresh(r => r + 1)}
                />
              </div>
            )}
            <FileList key={refresh} projectId={id as string} />
          </>
        )}
      </div>
    </div>
  )
}
