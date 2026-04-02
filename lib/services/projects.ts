import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types'

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('project:projects(*)')
    .eq('user_id', userId)

  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(d => d.project as Project)
}

export async function updateProject(projectId: string, name: string, description: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify user is a member of this project
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!membership) throw new Error('Not a project member')

  const { error } = await supabase
    .from('projects')
    .update({ name, description })
    .eq('id', projectId)

  if (error) throw error
}

export async function createProject(name: string, description: string, userId: string): Promise<Project> {
  const supabase = createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name, description, owner_id: userId })
    .select()
    .single()

  if (error) throw error

  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: userId,
      role: 'owner'
    })

  if (memberError) throw memberError

  return project
}

export async function deleteProject(projectId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Only the owner can delete the project
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('Project not found')
  if (project.owner_id !== user.id) throw new Error('Only the project owner can delete this project')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
}
