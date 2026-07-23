import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/api'

export default function UserMenu({ user, onLogoutRequest }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const initials = (user?.full_name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function goTo(path) {
    setOpen(false)
    navigate(path)
  }

  function logout() {
    setOpen(false)
    if (onLogoutRequest) {
      onLogoutRequest()
    } else {
      // Fallback for pages that don't wire in the survey-aware logout flow
      // (e.g. the Platform Admin dashboard) - behaves exactly as before.
      clearToken()
      window.location.href = 'https://automationgini.com/login'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full bg-navy text-white font-body font-semibold text-sm flex items-center justify-center hover:bg-blue transition-colors"
      >
        {initials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="font-body font-semibold text-sm text-navy truncate">{user?.full_name}</p>
              <p className="font-body text-xs text-slate-400 truncate">{user?.username}</p>
            </div>
            <button onClick={() => goTo('/account?tab=profile')} className="w-full text-left px-4 py-2 text-sm font-body text-navy hover:bg-slate-50">
              👤 Profile
            </button>
            <button onClick={() => goTo('/account?tab=settings')} className="w-full text-left px-4 py-2 text-sm font-body text-navy hover:bg-slate-50">
              ⚙️ Settings
            </button>
            <button onClick={() => goTo('/account?tab=plan')} className="w-full text-left px-4 py-2 text-sm font-body text-navy hover:bg-slate-50">
              📦 Plan
            </button>
            <button onClick={() => goTo('/account?tab=billing')} className="w-full text-left px-4 py-2 text-sm font-body text-navy hover:bg-slate-50">
              💳 Billing Information
            </button>
            <div className="border-t border-slate-100 mt-2 pt-2">
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-body text-red-600 hover:bg-red-50">
                🚪 Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
