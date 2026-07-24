import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Building2, Settings, Menu, X } from 'lucide-react'
import UserMenu from './UserMenu'

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/platform-owner' },
  { label: 'Agency Owners', icon: Building2, path: '/platform-owner/agency-owners' },
  { label: 'Admin Settings', icon: Settings, path: '/platform-owner/admin-settings' },
]

function SidebarContent({ user, onNavigate }) {
  return (
    <>
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="" className="h-6 w-auto" />
          <span className="font-display font-semibold text-base tracking-tight text-navy">
            Automation<span className="text-amber">Gini</span>
          </span>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-blue mt-1">Platform Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/platform-owner'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
                isActive ? 'bg-blue/10 text-blue' : 'text-slate hover:bg-slate-50'
              }`
            }
          >
            <item.icon size={17} strokeWidth={2} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="font-body text-sm font-semibold text-navy truncate">{user?.full_name}</p>
        <p className="font-mono text-xs text-slate-400">{user?.username}</p>
      </div>
    </>
  )
}

export default function PlatformAdminLayout({ user, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col shrink-0">
        <SidebarContent user={user} />
      </aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden fixed inset-0 bg-navy-deep/40 z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute top-5 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-navy"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent user={user} onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between lg:justify-end px-4 sm:px-8 shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-navy -ml-1"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <UserMenu user={user} />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
