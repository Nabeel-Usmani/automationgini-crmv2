import { NavLink } from 'react-router-dom'
import { Calendar, ClipboardList, Clock, LogOut } from 'lucide-react'
import { portalLogout } from '../lib/portalApi'

const NAV_ITEMS = [
  { label: 'Agenda', to: '/portal/agenda', icon: Calendar },
  { label: 'Services', to: '/portal/services', icon: ClipboardList },
  { label: 'Hours', to: '/portal/availability', icon: Clock },
]

export default function PortalLayout({ staff, children }) {
  async function handleLogout() {
    await portalLogout()
    window.location.href = '/portal/login'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-navy">{staff.business_name}</p>
          <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">Staff Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-sm text-slate hidden sm:inline">{staff.full_name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 font-body text-sm font-semibold text-slate hover:text-navy transition-colors">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 px-6 flex gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 font-body text-sm font-semibold px-4 py-3 border-b-2 transition-colors ${
                isActive ? 'border-blue text-navy' : 'border-transparent text-slate hover:text-navy'
              }`
            }
          >
            <item.icon size={14} /> {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
