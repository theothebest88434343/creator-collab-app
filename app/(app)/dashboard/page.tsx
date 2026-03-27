'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAllRecentActivity } from '@/lib/services/activity'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  project_id: string
  assignee_id: string | null
  created_at: string
  project?: { name: string }
}

type Activity = {
  id: string
  message: string
  type: string
  created_at: string
  project?: { name: string }
}

type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
}

function timeAgo(date: string) {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  async function loadTasks(supabase: any, user: any, projectIds: string[]) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, project:projects(name)')
      .eq('assignee_id', user.id)
      .neq('status', 'done')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(10)
    setMyTasks(tasks || [])

    if (projectIds.length > 0) {
      const { data: allOpenTasks } = await supabase
        .from('tasks')
        .select('*, project:projects(name)')
        .in('project_id', projectIds)
        .neq('status', 'done')
        .is('assignee_id', null)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(10)
      setAllTasks(allOpenTasks || [])
    }
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: memberships } = await supabase
        .from('project_members')
        .select('project:projects(*)')
        .eq('user_id', user.id)
        .limit(4)
      setRecentProjects((memberships || []).map((m: any) => m.project))

      const projectIds = (memberships || []).map((m: any) => m.project?.id).filter(Boolean)
      await loadTasks(supabase, user, projectIds)

      const activityData = await getAllRecentActivity(user.id)
      setActivity(activityData)

      setLoading(false)
    }
    load()
  }, [])

  async function handleTaskUpdated() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
    const projectIds = (memberships || []).map((m: any) => m.project_id)
    await loadTasks(supabase, user, projectIds)
  }

  const overdueTasks = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date())
  const dueSoonTasks = myTasks.filter(t => {
    if (!t.due_date) return false
    const due = new Date(t.due_date)
    const now = new Date()
    return due >= now && due.getTime() - now.getTime() < 1000 * 60 * 60 * 24 * 2
  })

  const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-green-400/10 text-green-400',
    medium: 'bg-yellow-400/10 text-yellow-400',
    high: 'bg-red-400/10 text-red-400',
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date()
    return (
      <div
        onClick={() => setSelectedTask(task)}
        className="bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3 hover:border-white/10 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/80 truncate flex-1">{task.title}</p>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {task.priority && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
            )}
            {task.due_date && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${isOverdue ? 'bg-red-400/10 text-red-400' : 'text-white/30'}`}>
                {isOverdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-white/30 mt-1">{(task as any).project?.name}</p>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-3 sm:p-4">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">My tasks</p>
            <p className="text-xl sm:text-2xl font-semibold text-white">{myTasks.length}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-3 sm:p-4">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Overdue</p>
            <p className={`text-xl sm:text-2xl font-semibold ${overdueTasks.length > 0 ? 'text-red-400' : 'text-white'}`}>
              {overdueTasks.length}
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-3 sm:p-4">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Unassigned</p>
            <p className={`text-xl sm:text-2xl font-semibold ${allTasks.length > 0 ? 'text-yellow-400' : 'text-white'}`}>
              {allTasks.length}
            </p>
          </div>
        </div>

        {/* Main content — stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">My tasks</h2>
              {myTasks.length === 0 ? (
                <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm text-white/30">No tasks assigned to you</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTasks.map(task => <TaskCard key={task.id} task={task} />)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                Unassigned tasks
                {allTasks.length > 0 && (
                  <span className="ml-2 bg-yellow-400/10 text-yellow-400 text-xs px-1.5 py-0.5 rounded-md normal-case font-normal">
                    {allTasks.length} need attention
                  </span>
                )}
              </h2>
              {allTasks.length === 0 ? (
                <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm text-white/30">All tasks are assigned</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allTasks.map(task => <TaskCard key={task.id} task={task} />)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Recent projects</h2>
              <div className="grid grid-cols-2 gap-3">
                {recentProjects.map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all">
                      <p className="text-sm font-medium text-white/80">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-white/30 mt-1 truncate">{project.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Recent activity</h2>
            {activity.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-white/30">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map(a => (
                  <div key={a.id} className="bg-[#1a1a1a] rounded-xl border border-white/5 px-4 py-3">
                    <p className="text-xs text-white/60">{a.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-white/20">{a.project?.name}</p>
                      <p className="text-xs text-white/20">{timeAgo(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={selectedTask.project_id}
          onUpdated={handleTaskUpdated}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}