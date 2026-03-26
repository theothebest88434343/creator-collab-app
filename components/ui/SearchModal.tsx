'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Result = {
  id: string
  title: string
  type: 'task' | 'project'
  subtitle: string
  projectId: string
}

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user's projects
    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)

    const projectIds = memberships?.map(m => m.project_id) || []
    if (!projectIds.length) { setLoading(false); return }

    // Search projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, description')
      .in('id', projectIds)
      .ilike('name', `%${q}%`)
      .limit(3)

    // Search tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, description, project_id, project:projects(name)')
      .in('project_id', projectIds)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(5)

    const projectResults: Result[] = (projects || []).map(p => ({
      id: p.id,
      title: p.name,
      type: 'project',
      subtitle: p.description || 'Project',
      projectId: p.id,
    }))

    const taskResults: Result[] = (tasks || []).map(t => ({
      id: t.id,
      title: t.title,
      type: 'task',
      subtitle: (t.project as any)?.name || 'Task',
      projectId: t.project_id,
    }))

    setResults([...projectResults, ...taskResults])
    setSelected(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected(p => Math.min(p + 1, results.length - 1))
      if (e.key === 'ArrowUp') setSelected(p => Math.max(p - 1, 0))
      if (e.key === 'Enter' && results[selected]) handleSelect(results[selected])
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [results, selected])

  function handleSelect(result: Result) {
    if (result.type === 'project') {
      router.push(`/projects/${result.projectId}`)
    } else {
      router.push(`/projects/${result.projectId}`)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-24 px-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-white/30 text-lg">⌕</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks and projects..."
            className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
          />
          {loading && <span className="text-white/30 text-xs animate-spin">⟳</span>}
          <kbd className="text-white/20 text-xs border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query && results.length === 0 && !loading && (
            <div className="px-4 py-8 text-center">
              <p className="text-white/30 text-sm">No results for "{query}"</p>
            </div>
          )}

          {!query && (
            <div className="px-4 py-8 text-center">
              <p className="text-white/30 text-sm">Type to search tasks and projects</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, i) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                    selected === i ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-base flex-shrink-0">
                    {result.type === 'project' ? '⊞' : '☐'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{result.title}</p>
                    <p className="text-xs text-white/30 truncate">{result.subtitle}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                    result.type === 'project'
                      ? 'bg-blue-400/10 text-blue-400'
                      : 'bg-white/5 text-white/30'
                  }`}>
                    {result.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4">
          <span className="text-xs text-white/20">↑↓ navigate</span>
          <span className="text-xs text-white/20">↵ select</span>
          <span className="text-xs text-white/20">ESC close</span>
        </div>
      </div>
    </div>
  )
}