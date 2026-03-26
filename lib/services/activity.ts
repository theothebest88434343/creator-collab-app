import { createClient } from '@/lib/supabase/client'

export async function logActivity({
  projectId,
  userId,
  type,
  message,
}: {
  projectId: string
  userId: string
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'member_added' | 'file_uploaded'
  message: string
}) {
  const supabase = createClient()
  await supabase.from('activity').insert({ project_id: projectId, user_id: userId, type, message })
}

export async function getRecentActivity(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

export async function getAllRecentActivity(userId: string) {
  const supabase = createClient()

  // Get all projects the user is a member of
  const { data: memberships } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId)

  if (!memberships?.length) return []

  const projectIds = memberships.map(m => m.project_id)

  const { data, error } = await supabase
    .from('activity')
    .select('*, project:projects(name)')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}