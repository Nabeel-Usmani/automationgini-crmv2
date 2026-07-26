import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalLogin } from '../lib/portalApi'

export default function PortalLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      await portalLogin(email.trim(), password)
      navigate('/portal/agenda', { replace: true })
    } catch (err) {
      setStatus(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h1 className="font-display font-semibold text-xl text-navy mb-1">Staff Login</h1>
          <p className="font-body text-sm text-slate">Sign in to manage your calendar.</p>
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        {status && <p className="font-body text-sm text-red-600">{status}</p>}
        <button type="submit" disabled={loading} className="w-full font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg py-2.5 transition-colors">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
