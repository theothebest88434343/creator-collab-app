'use client'

import { useState } from 'react'
import { uploadFile } from '@/lib/services/files'

const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

type Props = {
  projectId: string
  userId: string
  onUploaded: () => void
}

export function FileUpload({ projectId, userId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null
    if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`)
      setFile(null)
      e.target.value = ''
      return
    }
    setError(null)
    setFile(selected)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      await uploadFile(projectId, file, userId)
      setFile(null)
      onUploaded()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        type="file"
        onChange={handleFileChange}
        className="text-sm text-white/40 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white/70 hover:file:bg-white/20 hover:file:cursor-pointer file:min-h-[36px]"
      />
      <div className="flex items-center gap-3">
        {file && (
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors min-h-[40px]"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </form>
  )
}
