const API_BASE = 'https://api.automationgini.com'

export function getToken() {
  return localStorage.getItem('ag_token')
}

export function setToken(token) {
  localStorage.setItem('ag_token', token)
}

export function clearToken() {
  localStorage.removeItem('ag_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  // credentials: 'include' sends the shared ag_session cookie (set by the
  // website on login) so a request authenticates even with no token in
  // localStorage - the Authorization header above is still sent whenever a
  // token IS present, so this doesn't change behavior for existing sessions.
  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' })
  if (resp.status === 401) {
    clearToken()
    window.location.href = 'https://automationgini.com/login'
    return null
  }
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${resp.status})`)
  }
  return resp.json()
}

export function getMe() {
  return apiFetch('/auth/me')
}

// The session cookie is HttpOnly (can't be cleared by client JS), so an
// actual logout requires this call, not just clearToken(). Best-effort: if
// the request fails, callers should still proceed with clearing local state
// and redirecting - staying logged in due to a network blip is worse than a
// cookie that outlives the intended session by a request or two.
export function logoutRequest() {
  return apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
}

export function getDashboardSummary(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
  const qs = params.toString()
  return apiFetch(`/dashboard/summary${qs ? `?${qs}` : ''}`)
}

export function getFilterOptions() {
  return apiFetch('/dashboard/filter-options')
}

export function getCityCoordinates() {
  return apiFetch('/dashboard/city-coordinates')
}

export function logCall(leadId) {
  return apiFetch(`/dashboard/log-call?lead_id=${leadId}`, { method: 'POST' })
}
