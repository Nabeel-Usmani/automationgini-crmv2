import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { portalSetPassword } from '../lib/portalApi'

export default function PortalSetPassword() {
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    if (password.length < 8) { setStatus('Password needs to be at least 8 characters.'); return }
    if (password !== confirm) { setStatus('Passwords don’t match.'); return }
    setLoading(true)
    setStatus('')
    try {
      await portalSetPassword(inviteToken, password)
      navigate('/portal/agenda', { replace: true })
    } catch (err) {
      setStatus(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!inviteToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 text-center">
        <p className="font-body text-red-600 max-w-sm">This link is missing its invite code. Ask whoever set up your account for a fresh link.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h1 className="font-display font-semibold text-xl text-navy mb-1">Set Your Password</h1>
          <p className="font-body text-sm text-slate">Choose a password to finish setting up your account.</p>
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">New Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Confirm Password</label>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        {status && <p className="font-body text-sm text-red-600">{status}</p>}
        <button type="submit" disabled={loading} className="w-full font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg py-2.5 transition-colors">
          {loading ? 'Saving...' : 'Set Password & Sign In'}
        </button>
      </form>
    </div>
  )
}
