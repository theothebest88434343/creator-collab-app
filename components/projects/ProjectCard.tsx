import Link from 'next/link'
import { deleteProject } from '@/lib/services/projects'

type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
}

type Props = {
  project: Project
  onDeleted: () => void
}

export function ProjectCard({ project, onDeleted }: Props) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project?')) return
    await deleteProject(project.id)
    onDeleted()
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="relative bg-[#1a1a1a] rounded-xl border border-white/5 p-5 hover:border-white/20 hover:bg-[#1f1f1f] transition-all cursor-pointer group">
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
        >
          ✕
        </button>
        <h2 className="font-medium text-white mb-1">{project.name}</h2>
        {project.description && (
          <p className="text-sm text-white/40 line-clamp-2">{project.description}</p>
        )}
        <p className="text-xs text-white/20 mt-3">
          {new Date(project.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}