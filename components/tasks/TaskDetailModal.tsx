'use client'

import { useState, useEffect, useRef } from 'react'
import { updateTask, deleteTask } from '@/lib/services/tasks'
import { getMembers } from '@/lib/services/members'
import { createClient } from '@/lib/supabase/client'

type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  assignee_id: string | null
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

type Member = {
  user_id: string
  user: { id: string; full_name: string; email: string }
}

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  user?: { full_name: string; email: string }
}

type Props = {
  task: Task
  projectId: string
  onUpdated: () => void
  onClose: () => void
}

const PRIORITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

export function TaskDetailModal({ task, projectId, onUpdated, onClose }: Props) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [assigneeId, setAssigneeId] = useState(task.assignee_id || '')
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [members, setMembers] = useState<Member[]>([])
  const [saving, setSaving] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMembers(projectId).then(data => setMembers(data as Member[]))
    loadComments()

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })

    // Real-time comments
    const channel = supabase
      .channel(`comments:${task.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${task.id}`
      }, async (payload) => {
  const supabase = createClient()
  const { data: user } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', payload.new.user_id)
    .single()
  setComments(prev => [...prev, { ...payload.new, user } as Comment])
})
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${task.id}`
      }, (payload) => {
        setComments(prev => prev.filter(c => c.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, task.id])

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function loadComments() {
  const supabase = createClient()
  const { data } = await supabase
    .from('task_comments')
    .select('*, user:users!task_comments_user_id_fkey(full_name, email)')
    .eq('task_id', task.id)
    .order('created_at', { ascending: true })
  if (data) setComments(data as Comment[])
}
  async function handleAddComment(e: React.FormEvent) {
  e.preventDefault()
  if (!newComment.trim()) return
  setSubmittingComment(true)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('task_comments').insert({
    task_id: task.id,
    user_id: user.id,
    content: newComment.trim(),
  })

  setNewComment('')
  await loadComments()
  setSubmittingComment(false)
}

  async function handleDeleteComment(commentId: string) {
    const supabase = createClient()
    await supabase.from('task_comments').delete().eq('id', commentId)
  }

  async function handleSave() {
    setSaving(true)
    await updateTask(task.id, {
      title,
      description: description || undefined,
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
      priority: priority as 'low' | 'medium' | 'high',
    })
    onUpdated()
    setSaving(false)
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return
    await deleteTask(task.id)
    onUpdated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Task details</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — task details */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 border-r border-white/10">
            {/* Title */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a description..."
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className={`w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 ${PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}`}
                >
                  <option value="low" className="text-green-400">Low</option>
                  <option value="medium" className="text-yellow-400">Medium</option>
                  <option value="high" className="text-red-400">High</option>
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide mb-1 block">Assignee</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.full_name || m.user.email}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Delete task
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Right — comments */}
          <div className="w-72 flex flex-col">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {comments.length === 0 && (
                <p className="text-xs text-white/20 text-center py-4">No comments yet</p>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white/60">
                      {comment.user?.full_name || comment.user?.email || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/20">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {comment.user_id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/70 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    {comment.content}
                  </p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment input */}
            <form onSubmit={handleAddComment} className="px-4 py-3 border-t border-white/10">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment(e)
                  }
                }}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30 resize-none placeholder-white/20"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="mt-2 w-full rounded-lg bg-white/10 text-white/60 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {submittingComment ? 'Posting...' : 'Post comment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}