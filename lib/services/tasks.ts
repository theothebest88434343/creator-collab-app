import { createClient } from '@/lib/supabase/client'

export async function getTasks(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTask(projectId: string, title: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title,
      created_by: userId,
      status: 'todo'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'done') {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) throw error
}

export async function deleteTask(taskId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}