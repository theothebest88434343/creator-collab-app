// lib/services/members.ts
import { createClient } from '@/lib/supabase/client'

// Get all members of a project
export async function getMembers(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('*, user:users(id, full_name, email)')
    .eq('project_id', projectId)

  if (error) throw error
  return data
}

// Invite a new member
export async function inviteMember(projectId: string, email: string) {
  const res = await fetch('/api/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, email }),
  })

  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to send invite.')
  }
}

// Remove a member from a project
export async function removeMember(projectId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) throw error
}