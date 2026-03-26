import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/services/notifications'

export async function getTasks(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_fkey(id, full_name, email)')
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

  // Get task details for notification
  const { data: task } = await supabase
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_fkey(id)')
    .eq('id', taskId)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) throw error

  // Notify assignee if there is one
  if (task?.assignee?.id) {
    await createNotification({
      userId: task.assignee.id,
      type: 'task_status_changed',
      message: `Task "${task.title}" was moved to ${status.replace('_', ' ')}`,
      projectId: task.project_id,
    })
  }
}

export async function updateTask(taskId: string, updates: {
  title?: string
  description?: string
  due_date?: string | null
  assignee_id?: string | null
  priority?: 'low' | 'medium' | 'high'
}) {
  const supabase = createClient()

  // Get old task to check if assignee changed
  const { data: oldTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) throw error

  // Notify new assignee if assignee changed
  if (updates.assignee_id && updates.assignee_id !== oldTask?.assignee_id) {
    await createNotification({
      userId: updates.assignee_id,
      type: 'task_assigned',
      message: `You were assigned to task "${oldTask?.title}"`,
      projectId: oldTask?.project_id,
    })
  }
}

export async function deleteTask(taskId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}