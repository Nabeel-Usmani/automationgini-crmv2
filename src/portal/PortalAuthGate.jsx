import { useEffect, useState } from 'react'
import { portalGetMe } from '../lib/portalApi'
import PortalLayout from './PortalLayout'

// Mirrors PlatformOwnerAuth's shape, but for a completely separate identity -
// client-business staff, not AutomationGini users. No localStorage
// pre-check: the session lives entirely in the ag_portal_session cookie,
// and portalFetch already redirects to /portal/login on a 401.
export default function PortalAuthGate({ children }) {
  const [staff, setStaff] = useState(null)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    portalGetMe()
      .then((s) => { if (!s) return; setStaff(s) })
      .catch((e) => setAuthError(e.message))
  }, [])

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="font-body text-red-600">{authError}</p>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="font-body text-slate">Loading...</p>
      </div>
    )
  }

  return (
    <PortalLayout staff={staff}>
      {typeof children === 'function' ? children(staff) : children}
    </PortalLayout>
  )
}
