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
  const supabase = createClient()

  // 1️⃣ Get current logged-in user (inviter)
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Not authenticated')

  const inviterName = user.user_metadata?.full_name || 'Someone'

  // 2️⃣ Find the invitee by email
  const { data: invitee, error: userError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('email', email)
    .single()

  if (userError || !invitee) throw new Error('No account found with that email.')

  // 3️⃣ Add invitee to project
  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: invitee.id, role: 'member' })

  if (error) throw new Error('Could not add member. They may already be in this project.')

  // 4️⃣ Send invite email via Supabase Function
  await sendInviteEmail(projectId, email, inviterName)
}

// Function to send invite email
export async function sendInviteEmail(projectId: string, email: string, inviterName: string) {
  const message = `
Hi there,

${inviterName} has invited you to join a project (ID: ${projectId}) on our platform.
Please log in or sign up to access the project.

Thanks!
  `

  // Call your Supabase Function that handles sending emails
  const res = await fetch('/supabase/functions/send-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, subject: 'Project Invitation', text: message }),
  })

  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to send invite email.')
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