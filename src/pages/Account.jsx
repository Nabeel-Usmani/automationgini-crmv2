import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import TabButton from '../components/TabButton'

export default function Account({ user }) {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'profile'
  const [tab, setTab] = useState(initialTab)

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Account</h1>
      <p className="font-body text-slate mb-6">Manage your profile, plan, and billing.</p>

      <div className="flex gap-2 mb-6">
        <TabButton active={tab === 'profile'} onClick={() => setTab('profile')}>👤 Profile</TabButton>
        <TabButton active={tab === 'settings'} onClick={() => setTab('settings')}>⚙️ Settings</TabButton>
        <TabButton active={tab === 'plan'} onClick={() => setTab('plan')}>📦 Plan</TabButton>
        <TabButton active={tab === 'billing'} onClick={() => setTab('billing')}>💳 Billing Information</TabButton>
      </div>

      {tab === 'profile' && <ProfileTab user={user} />}
      {tab === 'settings' && <SettingsTab />}
      {tab === 'plan' && <PlanTab user={user} />}
      {tab === 'billing' && <BillingTab user={user} />}
    </div>
  )
}

function ProfileTab({ user }) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [status, setStatus] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwStatus, setPwStatus] = useState('')

  async function saveName() {
    setStatus('Saving...')
    try {
      await apiFetch('/auth/profile', { method: 'PATCH', body: JSON.stringify({ full_name: fullName }) })
      setStatus('Saved!')
    } catch (e) {
      setStatus(e.message)
    }
  }

  async function changePassword() {
    setPwStatus('Updating...')
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      setPwStatus('Password updated!')
      setCurrentPw(''); setNewPw('')
    } catch (e) {
      setPwStatus(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <p className="font-body font-semibold text-navy">Your Information</p>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">Email</label>
          <input value={user?.username || ''} disabled className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body bg-slate-50 text-slate-400" />
        </div>
        <button onClick={saveName} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2 transition-colors">
          Save
        </button>
        {status && <p className="font-body text-sm text-slate">{status}</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <p className="font-body font-semibold text-navy">Change Password</p>
        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min 8 characters)" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <button onClick={changePassword} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2 transition-colors">
          Update Password
        </button>
        {pwStatus && <p className="font-body text-sm text-slate">{pwStatus}</p>}
      </div>
    </div>
  )
}

function SettingsTab() {
  const [emailNewLead, setEmailNewLead] = useState(true)
  const [emailDemoComplete, setEmailDemoComplete] = useState(true)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <p className="font-body font-semibold text-navy mb-2">Notification Preferences</p>
      <label className="flex items-center gap-3 text-sm font-body text-navy">
        <input type="checkbox" checked={emailNewLead} onChange={(e) => setEmailNewLead(e.target.checked)} className="accent-blue" />
        Email me when a search finishes finding new leads
      </label>
      <label className="flex items-center gap-3 text-sm font-body text-navy">
        <input type="checkbox" checked={emailDemoComplete} onChange={(e) => setEmailDemoComplete(e.target.checked)} className="accent-blue" />
        Email me when a website build finishes
      </label>
      <p className="text-xs font-body text-slate-400 pt-2">More settings — like timezone and default search criteria — coming soon.</p>
    </div>
  )
}

function PlanTab({ user }) {
  const [data, setData] = useState(null)

  useEffect(() => { apiFetch('/billing/summary').then(setData).catch(() => {}) }, [])

  if (!data) return <p className="font-body text-slate">Loading...</p>

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {Object.entries(data.all_plans).map(([name, plan]) => {
        const isCurrent = name === data.plan_name
        return (
          <div key={name} className={`bg-white border rounded-2xl p-5 ${isCurrent ? 'border-blue ring-2 ring-blue/20' : 'border-slate-200'}`}>
            {isCurrent && <span className="inline-block text-xs font-semibold text-blue bg-blue/10 rounded-full px-2.5 py-1 mb-2">Current Plan</span>}
            <p className="font-display font-semibold text-navy mb-1">{name}</p>
            <p className="font-mono text-lg text-navy mb-3">{plan.price != null ? `$${plan.price}/mo` : 'Custom'}</p>
            <ul className="space-y-1 text-xs font-body text-slate">
              <li>{plan.leads ?? 'Unlimited'} leads</li>
              <li>{plan.vapi_call ?? 'Unlimited'} voice demos</li>
              <li>{plan.mockup ?? 'Unlimited'} mockups</li>
              <li>{plan.agents ?? 'Unlimited'} agent seat{plan.agents === 1 ? '' : 's'}</li>
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function BillingTab({ user }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <p className="font-body font-semibold text-navy mb-2">Payment Method</p>
      <p className="font-body text-sm text-slate mb-4">
        No payment method on file yet. Billing details will appear here once you're on a paid plan.
      </p>
      <p className="font-body text-sm text-navy"><strong>Company:</strong> {user?.company_name}</p>
      <p className="font-body text-sm text-navy"><strong>Current Plan:</strong> {user?.plan_name}</p>
    </div>
  )
}
