import { createClient } from '@/lib/supabase/client'

export async function getMembers(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('*, user:users(id, full_name, email)')
    .eq('project_id', projectId)

  if (error) throw error
  return data
}

export async function inviteMember(projectId: string, email: string) {
  const supabase = createClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !user) throw new Error('No account found with that email.')

  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: user.id, role: 'member' })

  if (error) throw new Error('Could not add member. They may already be in this project.')
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) throw error
}