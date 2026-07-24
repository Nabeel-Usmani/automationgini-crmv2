import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import UserMenu from './UserMenu'
import SurveyModal from './SurveyModal'
import useInactivityTimeout from '../hooks/useInactivityTimeout'
import { getMe, clearToken, apiFetch, logoutRequest } from '../lib/api'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [surveyTrigger, setSurveyTrigger] = useState(null) // null | 'login' | 'logout'
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  async function performLogout() {
    await logoutRequest() // clears the HttpOnly session cookie server-side
    clearToken()
    window.location.href = 'https://automationgini.com/login'
  }

  const requestLogout = useCallback(async () => {
    try {
      const check = await apiFetch('/survey/check?trigger=logout')
      if (check.should_show) {
        setSurveyTrigger('logout')
        return
      }
    } catch {
      // If the check fails, don't block the user from logging out.
    }
    performLogout()
  }, [])

  // Auto-logout after a period of inactivity, routed through the same
  // survey-aware logout path as a manual logout.
  useInactivityTimeout(requestLogout, 20 * 60 * 1000)

  useEffect(() => {
    // No localStorage pre-check here: a session may now live entirely in the
    // shared ag_session cookie (set by the website on login), with nothing
    // in localStorage at all. getMe() is the real check either way - if
    // there's no valid session (cookie or token), apiFetch's 401 handling
    // already redirects to login.
    getMe().then(async (u) => {
      // apiFetch already redirects to login on a 401 and resolves this to
      // null in that case - nothing left to do here, the navigation is
      // already in flight.
      if (!u) return

      // Platform owner always lands on the platform dashboard, regardless of
      // which role's login page or portal they came in through.
      if (u.is_platform_owner && !location.pathname.startsWith('/platform-owner')) {
        navigate('/platform-owner', { replace: true })
        return
      }
      setUser(u)

      try {
        const check = await apiFetch('/survey/check?trigger=login')
        if (check.should_show) setSurveyTrigger('login')
      } catch {
        // Non-blocking - if the check fails, just skip the survey this time.
      }
    }).catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-red-600">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-slate">Loading your account...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between lg:justify-end px-4 sm:px-8 shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-navy -ml-1"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <UserMenu user={user} onLogoutRequest={requestLogout} />
        </header>
        <main className="flex-1">{typeof children === 'function' ? children(user) : children}</main>
      </div>

      {surveyTrigger && (
        <SurveyModal
          trigger={surveyTrigger}
          onComplete={() => {
            setSurveyTrigger(null)
            if (surveyTrigger === 'logout') performLogout()
          }}
        />
      )}
    </div>
  )
}
