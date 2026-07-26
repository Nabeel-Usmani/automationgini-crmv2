// Fetch wrapper for the client-business staff portal (/portal/*) - a
// completely separate identity from the agency's apiFetch in api.js. Portal
// sessions are cookie-only (ag_portal_session, HttpOnly) with no token ever
// held in JS, so there's no Authorization header or localStorage token here.
// A 401 sends the user to /portal/login (a route in this same app), not to
// the agency's automationgini.com/login - two different logins entirely.
const API_BASE = 'https://api.automationgini.com'

export async function portalFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' })
  if (resp.status === 401) {
    if (!window.location.pathname.startsWith('/portal/login')) {
      window.location.href = '/portal/login'
    }
    return null
  }
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${resp.status})`)
  }
  return resp.json()
}

export function portalGetMe() {
  return portalFetch('/portal/auth/me')
}

export function portalLogin(email, password) {
  return portalFetch('/portal/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function portalSetPassword(inviteToken, password) {
  return portalFetch('/portal/auth/set-password', { method: 'POST', body: JSON.stringify({ invite_token: inviteToken, password }) })
}

export function portalLogout() {
  return portalFetch('/portal/auth/logout', { method: 'POST' }).catch(() => {})
}

export function listServices() {
  return portalFetch('/portal/services')
}

export function createService(service) {
  return portalFetch('/portal/services', { method: 'POST', body: JSON.stringify(service) })
}

export function updateService(id, service) {
  return portalFetch(`/portal/services/${id}`, { method: 'PATCH', body: JSON.stringify(service) })
}

export function deactivateService(id) {
  return portalFetch(`/portal/services/${id}`, { method: 'DELETE' })
}

export function listAvailability() {
  return portalFetch('/portal/availability')
}

export function replaceAvailability(windows) {
  return portalFetch('/portal/availability', { method: 'PUT', body: JSON.stringify(windows) })
}

export function listAppointments(fromDate, toDate) {
  const params = new URLSearchParams()
  if (fromDate) params.set('from_date', fromDate)
  if (toDate) params.set('to_date', toDate)
  const qs = params.toString()
  return portalFetch(`/portal/appointments${qs ? `?${qs}` : ''}`)
}

export function createAppointment(appointment) {
  return portalFetch('/portal/appointments', { method: 'POST', body: JSON.stringify(appointment) })
}

export function cancelAppointment(id) {
  return portalFetch(`/portal/appointments/${id}/cancel`, { method: 'PATCH' })
}
