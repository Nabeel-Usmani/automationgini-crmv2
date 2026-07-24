import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '../lib/api'

// The website now redirects straight to /dashboard after login - the shared
// ag_session cookie already carries the session, no token needed in the
// URL. This page only exists for old cached links/bookmarks that still
// include ?token=... - it stores that token (for backward compatibility)
// and moves on. With no token, it just forwards to /dashboard: if the
// cookie is valid that works fine, and if not, Layout's own session check
// will redirect to login.
export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) setToken(token)
    navigate('/dashboard', { replace: true })
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <p className="font-body text-white/70">Signing you in...</p>
    </div>
  )
}
