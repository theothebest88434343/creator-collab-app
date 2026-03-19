'use client'

import { useEffect, useState } from 'react'
import { getFiles, getFileUrl } from '@/lib/services/files'

type Props = {
  projectId: string
}

export function FileList({ projectId }: Props) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [projectId])

  async function load() {
    const data = await getFiles(projectId)
    setFiles(data)
    setLoading(false)
  }

  async function handleDownload(storagePath: string, name: string) {
    const url = await getFileUrl(storagePath)
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
  }

  if (loading) return <p className="text-sm text-white/40">Loading files...</p>
  if (files.length === 0) return <p className="text-sm text-white/40">No files uploaded yet.</p>

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div key={file.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all">
          <div>
            <p className="text-sm font-medium text-white/80">{file.name}</p>
            <p className="text-xs text-white/30">
              {(file.size_bytes / 1024).toFixed(1)} KB · {new Date(file.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleDownload(file.storage_path, file.name)}
            className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors"
          >
            Download
          </button>
        </div>
      ))}
    </div>
  )
}