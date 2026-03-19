import { createClient } from '@/lib/supabase/client'

export async function getProjects(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('project:projects(*)')
    .eq('user_id', userId)

  if (error) throw error
  return data.map((d: any) => d.project)
}

export async function createProject(name: string, description: string, userId: string) {
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