import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/services/notifications'
import { logActivity } from '@/lib/services/activity'

async function assertProjectMember(supabase: ReturnType<typeof createClient>, projectId: string, userId: string) {
  const { data } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()
  if (!data) throw new Error('Not a project member')
}

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
  await assertProjectMember(supabase, projectId, userId)

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

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .single()
  const name = profile?.full_name || profile?.email || 'Someone'
  await logActivity({ projectId, userId, type: 'task_created', message: `${name} created task "${title}"` })

  return data
}

export async function updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'done') {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: task } = await supabase
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_fkey(id)')
    .eq('id', taskId)
    .single()

  if (!task) throw new Error('Task not found')
  await assertProjectMember(supabase, task.project_id, user.id)

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) throw error

  const { data: profile } = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
  const name = profile?.full_name || profile?.email || 'Someone'
  await logActivity({
    projectId: task.project_id,
    userId: user.id,
    type: 'task_updated',
    message: `${name} moved "${task.title}" to ${status.replace('_', ' ')}`,
  })

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: oldTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (!oldTask) throw new Error('Task not found')
  await assertProjectMember(supabase, oldTask.project_id, user.id)

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) throw error

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single()
  if (!task) throw new Error('Task not found')

  await assertProjectMember(supabase, task.project_id, user.id)

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error

  const { data: profile } = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
  const name = profile?.full_name || profile?.email || 'Someone'
  await logActivity({
    projectId: task.project_id,
    userId: user.id,
    type: 'task_deleted',
    message: `${name} deleted task "${task.title}"`,
  })
}
