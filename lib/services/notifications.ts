import { createClient } from '@/lib/supabase/client'

export async function createNotification({
  userId,
  type,
  message,
  projectId,
}: {
  userId: string
  type: 'task_assigned' | 'project_added' | 'task_status_changed' | 'file_uploaded'
  message: string
  projectId?: string
}) {
  const supabase = createClient()
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    message,
    project_id: projectId || null,
  })
}