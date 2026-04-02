export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  assignee_id: string | null
  project_id: string
  created_by: string
  created_at: string
  assignee?: { id: string; full_name: string; email: string } | null
  project?: { name: string }
}

export type Project = {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

export type Member = {
  user_id: string
  role: string
  user: { id: string; full_name: string; email: string }
}

export type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  task_id: string
  user?: { full_name: string; email: string }
}

export type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
  project_id: string | null
}

export type Activity = {
  id: string
  message: string
  type: string
  created_at: string
  project_id: string
  user_id: string
  project?: { name: string }
}
