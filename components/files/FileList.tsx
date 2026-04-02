'use client'

import { useEffect, useState } from 'react'
import { getFiles, getFileUrl } from '@/lib/services/files'
import { FilePreviewModal } from './FilePreviewModal'

type ProjectFile = {
  id: string
  name: string
  storage_path: string
  size_bytes: number
  mime_type: string
  created_at: string
}

type Props = {
  projectId: string
}

export function FileList({ projectId }: Props) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)

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

  function getFileIcon(mimeType: string) {
    if (mimeType?.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📕'
    if (mimeType?.includes('word')) return '📝'
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return '📊'
    return '📄'
  }

  if (loading) return <p className="text-sm text-white/40">Loading files...</p>

  if (files.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-white/10">
      <p className="text-3xl mb-3">📁</p>
      <p className="text-sm font-medium text-white/40">No files yet</p>
      <p className="text-xs text-white/20 mt-1">Upload a file above to get started</p>
    </div>
  )

  return (
    <>
      <div className="space-y-2">
        {files.map(file => (
          <div
            key={file.id}
            className="flex items-center justify-between bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all cursor-pointer"
            onClick={() => setPreviewFile(file)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xl flex-shrink-0">{getFileIcon(file.mime_type)}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{file.name}</p>
                <p className="text-xs text-white/30">
                  {(file.size_bytes / 1024).toFixed(1)} KB · {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={e => {
                e.stopPropagation()
                handleDownload(file.storage_path, file.name)
              }}
              className="ml-3 flex-shrink-0 text-sm text-white/40 hover:text-white/70 font-medium transition-colors px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ↓
            </button>
          </div>
        ))}
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  )
}
