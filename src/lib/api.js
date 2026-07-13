const API_BASE = 'https://automationgini-api.onrender.com'

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
  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (resp.status === 401) {
    clearToken()
    window.location.href = 'https://automationgini-website.onrender.com/login'
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
