import { useEffect, useState } from 'react'
import { getMe } from '../lib/api'
import PlatformAdminLayout from './PlatformAdminLayout'

export default function PlatformOwnerAuth({ children }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // No localStorage pre-check: a session may live entirely in the shared
    // ag_session cookie set by the website on login. getMe() is the real
    // check - apiFetch already redirects to login on a 401.
    getMe()
      .then((u) => {
        if (!u) return
        if (!u.is_platform_owner) { setAuthError('Not authorized.'); return }
        setUser(u)
      })
      .catch((e) => setAuthError(e.message))
  }, [])

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-red-600">{authError}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-slate">Loading...</p>
      </div>
    )
  }

  return (
    <PlatformAdminLayout user={user}>
      {typeof children === 'function' ? children(user) : children}
    </PlatformAdminLayout>
  )
}
