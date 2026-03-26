'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { SearchModal } from '@/components/ui/SearchModal'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: '⊞  Dashboard', href: '/dashboard' },
  { label: '⊞  Projects', href: '/projects' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [initial, setInitial] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const name = profile?.full_name || ''
      setFullName(name)
      setInitial((name || user.email || '?')[0].toUpperCase())
    }
    load()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close sidebar when navigating
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-lg tracking-tight">Collab.</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white/30 hover:text-white/70 transition-colors"
        >
          ✕
        </button>
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
              {item.label}
            </Link>
          )
        })}

        {/* Search button */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <span className="text-base">⌕</span>
          <span className="flex-1 text-left">Search</span>
          <kbd className="text-white/20 text-xs border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        {userId && <NotificationBell userId={userId} />}

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/settings'
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <span className="text-base">⚙</span>
          Settings
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <span className="text-base">→</span>
          Sign out
        </button>

        {/* User profile */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors mt-2"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/60 flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 truncate">{fullName || 'No name set'}</p>
            <p className="text-xs text-white/30 truncate">{email}</p>
          </div>
        </Link>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 fixed top-0 left-0 h-screen bg-[#141414] border-r border-white/5 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-[#141414] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#141414] border-b border-white/5 flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/60 hover:text-white transition-colors text-xl"
        >
          ☰
        </button>
        <span className="text-white font-semibold text-lg tracking-tight">Collab.</span>
        <button
          onClick={() => setShowSearch(true)}
          className="text-white/60 hover:text-white transition-colors text-xl"
        >
          ⌕
        </button>
      </div>

      {/* Main content */}
      <main className="md:ml-64 flex-1 min-h-screen pt-14 md:pt-0">
        {children}
      </main>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  )
}
