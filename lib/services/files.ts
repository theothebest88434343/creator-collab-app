import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/services/activity'

function sanitizeFilename(name: string): string {
  // Strip path separators and dangerous characters, keep extension
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '_')
}

export async function getFiles(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function uploadFile(projectId: string, file: File, userId: string) {
  const supabase = createClient()

  // Use a random UUID prefix + sanitized filename to prevent path traversal and collisions
  const randomPrefix = crypto.randomUUID()
  const safeName = sanitizeFilename(file.name)
  const path = `${projectId}/${randomPrefix}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(path, file)

  if (uploadError) throw uploadError

  const { error: dbError } = await supabase.from('files').insert({
    project_id: projectId,
    uploaded_by: userId,
    name: file.name, // store original display name
    storage_path: path,
    size_bytes: file.size,
    mime_type: file.type,
  })

  if (dbError) {
    // Clean up the uploaded file if DB insert fails
    await supabase.storage.from('project-files').remove([path])
    throw dbError
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .single()
  const name = profile?.full_name || profile?.email || 'Someone'
  await logActivity({
    projectId,
    userId,
    type: 'file_uploaded',
    message: `${name} uploaded "${file.name}"`,
  })
}

export async function getFileUrl(storagePath: string) {
  const supabase = createClient()
  const { data } = await supabase.storage
    .from('project-files')
    .createSignedUrl(storagePath, 3600)
  return data?.signedUrl
}
