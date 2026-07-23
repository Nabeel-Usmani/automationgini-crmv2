import { useEffect, useState } from 'react'
import { getMe, getToken, clearToken } from '../lib/api'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getToken()) {
      window.location.href = 'https://automationgini.com/login'
      return
    }
    getMe()
      .then(setUser)
      .catch((e) => setError(e.message))
  }, [])

  function handleLogout() {
    clearToken()
    window.location.href = 'https://automationgini.com/login'
  }

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
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <h1 className="font-display font-semibold text-lg text-navy">⚡ AutomationGini</h1>
        <div className="flex items-center gap-4">
          <span className="font-body text-sm text-slate">{user.full_name}</span>
          <button
            onClick={handleLogout}
            className="font-body text-sm font-semibold text-slate hover:text-navy"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="font-display font-semibold text-2xl text-navy mb-2">
          Welcome, {user.full_name.split(' ')[0]}
        </h2>
        <p className="font-body text-slate mb-8">
          {user.company_name} · {user.plan_name} plan
          {user.is_platform_owner && ' · Platform Owner'}
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="font-mono text-xs text-slate-400 mb-2">SESSION VERIFIED</p>
          <p className="font-body text-sm text-navy">
            This dashboard is a proof-of-concept shell — real CRM pages (Leads, Demo Center,
            Build Center, etc.) get built next, all authenticating through this same session.
          </p>
        </div>
      </main>
    </div>
  )
}
