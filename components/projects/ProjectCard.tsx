import Link from 'next/link'

type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-5 hover:border-white/20 hover:bg-[#1f1f1f] transition-all cursor-pointer">
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