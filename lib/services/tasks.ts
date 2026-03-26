import { createClient } from '@/lib/supabase/client'

export async function getTasks(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:users(id, full_name, email)')
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

export async function updateTask(taskId: string, updates: {
  title?: string
  description?: string
  due_date?: string | null
  assignee_id?: string | null
  priority?: 'low' | 'medium' | 'high'
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .update(updates)
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