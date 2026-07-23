import { NavLink } from 'react-router-dom'
import UserMenu from './UserMenu'

const NAV_ITEMS = [
  { label: 'Home', icon: '🏠', path: '/platform-owner' },
  { label: 'Agency Owners', icon: '🏢', path: '/platform-owner/agency-owners' },
  { label: 'Admin Settings', icon: '⚙️', path: '/platform-owner/admin-settings' },
]

export default function PlatformAdminLayout({ user, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-200">
          <img src="/logo.svg" alt="AutomationGini" className="h-6 mb-1" />
          <p className="font-mono text-[11px] uppercase tracking-wide text-blue mt-0.5">Platform Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/platform-owner'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors ${
                  isActive ? 'bg-blue/10 text-blue' : 'text-slate hover:bg-slate-50'
                }`
              }
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-200">
          <p className="font-body text-sm font-semibold text-navy truncate">{user?.full_name}</p>
          <p className="font-mono text-xs text-slate-400">{user?.username}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
          <UserMenu user={user} />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
