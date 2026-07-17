import { useEffect, useState } from 'react'
import { getMe, getToken } from '../lib/api'
import PlatformAdminLayout from './PlatformAdminLayout'

export default function PlatformOwnerAuth({ children }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!getToken()) {
      window.location.href = 'https://automationgini-website.onrender.com/login'
      return
    }
    getMe()
      .then((u) => {
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
