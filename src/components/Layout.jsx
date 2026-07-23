import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import UserMenu from './UserMenu'
import SurveyModal from './SurveyModal'
import useInactivityTimeout from '../hooks/useInactivityTimeout'
import { getMe, getToken, clearToken, apiFetch } from '../lib/api'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [surveyTrigger, setSurveyTrigger] = useState(null) // null | 'login' | 'logout'
  const location = useLocation()
  const navigate = useNavigate()

  function performLogout() {
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
    if (!getToken()) {
      window.location.href = 'https://automationgini.com/login'
      return
    }
    getMe().then(async (u) => {
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
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
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
