'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'

const navItems = [
  { label: 'Projects', href: '/projects' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 h-screen bg-[#141414] border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <span className="text-white font-semibold text-lg tracking-tight">Vault.</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-white/20'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}