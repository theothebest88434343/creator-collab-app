'use client'

import { useState } from 'react'
import { uploadFile } from '@/lib/services/files'

type Props = {
  projectId: string
  userId: string
  onUploaded: () => void
}

export function FileUpload({ projectId, userId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      await uploadFile(projectId, file, userId)
      setFile(null)
      onUploaded()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex items-center gap-3">
      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="text-sm text-white/40 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white/70 hover:file:bg-white/20 hover:file:cursor-pointer"
      />
      {file && (
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white text-black px-4 py-1.5 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  )
}