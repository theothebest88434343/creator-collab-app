'use client'

import { useEffect, useState } from 'react'
import { getFileUrl } from '@/lib/services/files'

type File = {
  id: string
  name: string
  storage_path: string
  size_bytes: number
  mime_type: string
  created_at: string
}

type Props = {
  file: File
  onClose: () => void
}

export function FilePreviewModal({ file, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFileUrl(file.storage_path).then(u => {
      setUrl(u || null)
      setLoading(false)
    })
  }, [file.storage_path])

  const isImage = file.mime_type?.startsWith('image/')
  const isPdf = file.mime_type === 'application/pdf'

  async function handleDownload() {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-sm font-medium text-white/80 truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {(file.size_bytes / 1024).toFixed(1)} KB · {new Date(file.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="text-sm text-white/40 hover:text-white/70 font-medium transition-colors"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[300px]">
          {loading ? (
            <p className="text-white/30 text-sm">Loading preview...</p>
          ) : !url ? (
            <p className="text-white/30 text-sm">Could not load preview.</p>
          ) : isImage ? (
            <img
              src={url}
              alt={file.name}
              className="max-w-full max-h-[60vh] rounded-lg object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={url}
              className="w-full h-[60vh] rounded-lg"
              title={file.name}
            />
          ) : (
            <div className="text-center">
              <p className="text-4xl mb-4">📄</p>
              <p className="text-white/40 text-sm mb-4">No preview available for this file type</p>
              <button
                onClick={handleDownload}
                className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}