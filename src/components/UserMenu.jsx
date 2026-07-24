import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { User, Settings, Package, CreditCard, LogOut } from 'lucide-react'
import { clearToken } from '../lib/api'

const MENU_ITEMS = [
  { label: 'Profile', tab: 'profile', icon: User },
  { label: 'Settings', tab: 'settings', icon: Settings },
  { label: 'Plan', tab: 'plan', icon: Package },
  { label: 'Billing Information', tab: 'billing', icon: CreditCard },
]

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

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-20 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 origin-top-right"
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-body font-semibold text-sm text-navy truncate">{user?.full_name}</p>
                <p className="font-body text-xs text-slate-400 truncate">{user?.username}</p>
              </div>
              {MENU_ITEMS.map(({ label, tab, icon: Icon }) => (
                <button
                  key={tab}
                  onClick={() => goTo(`/account?tab=${tab}`)}
                  className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-sm font-body text-navy hover:bg-slate-50"
                >
                  <Icon size={15} className="text-slate-400" />
                  {label}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button onClick={logout} className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-sm font-body text-red-600 hover:bg-red-50">
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
