import { useEffect, useState } from 'react'
import { apiFetch, getMe } from '../lib/api'

// While in beta, actual dollar amounts are hidden from regular demo/testing
// users so pricing isn't anchored before it's finalized. Platform owners
// always see real numbers. Flip this off once pricing is ready to reveal.
const BLUR_PRICING_FOR_USERS = true

function Price({ amount, blurred }) {
  if (amount == null) return <span>Custom</span>
  if (!blurred) return <span>${amount}/mo</span>
  return (
    <span className="relative inline-block">
      <span className="blur-[6px] select-none pointer-events-none">${amount}/mo</span>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-slate-400">
        hidden
      </span>
    </span>
  )
}

export default function Billing() {
  const [data, setData] = useState(null)
  const [isPlatformOwner, setIsPlatformOwner] = useState(false)

  useEffect(() => {
    apiFetch('/billing/summary').then(setData).catch(() => {})
    getMe().then((u) => setIsPlatformOwner(!!u.is_platform_owner)).catch(() => {})
  }, [])

  if (!data) return <div className="px-8 py-8 font-body text-slate">Loading...</div>

  const shouldBlur = BLUR_PRICING_FOR_USERS && !isPlatformOwner

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Billing & Plan</h1>
      <p className="font-body text-slate mb-6">{data.company_name}</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <span className="inline-block text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2.5 py-1 mb-2">Current Plan</span>
        <p className="font-display font-semibold text-2xl text-navy">
          {data.plan_name} — <Price amount={data.caps.price} blurred={shouldBlur} />
        </p>
      </div>

      <h2 className="font-body font-semibold text-navy mb-3">Usage This Month</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <UsageCard label="Leads" used={data.usage_this_month.leads} cap={data.caps.leads} />
        <UsageCard label="Voice Demos" used={data.usage_this_month.vapi_call} cap={data.caps.vapi_call} />
        <UsageCard label="Mockups" used={data.usage_this_month.mockup} cap={data.caps.mockup} />
        <UsageCard label="Chatbot Demos" used={data.usage_this_month.chatbot_demo} cap={data.caps.chatbot_demo} />
      </div>

      <h2 className="font-body font-semibold text-navy mb-3">All Plans</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(data.all_plans).map(([name, plan]) => (
          <div key={name} className={`bg-white border rounded-2xl p-5 ${name === data.plan_name ? 'border-blue ring-2 ring-blue/20' : 'border-slate-200'}`}>
            <p className="font-display font-semibold text-navy mb-1">{name}</p>
            <p className="font-mono text-lg text-navy mb-3">
              <Price amount={plan.price} blurred={shouldBlur} />
            </p>
            <ul className="space-y-1 text-xs font-body text-slate">
              <li>{plan.leads ?? 'Unlimited'} leads</li>
              <li>{plan.vapi_call ?? 'Unlimited'} voice demos</li>
              <li>{plan.mockup ?? 'Unlimited'} mockups</li>
              <li>{plan.agents ?? 'Unlimited'} agent seat{plan.agents === 1 ? '' : 's'}</li>
            </ul>
          </div>
        ))}
      </div>

      {shouldBlur && (
        <p className="font-mono text-xs text-slate-400 mt-6">
          Pricing is hidden during the beta period.
        </p>
      )}
    </div>
  )
}

function UsageCard({ label, used, cap }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className="font-display font-semibold text-xl text-navy">{used} {cap != null && <span className="text-sm text-slate-400 font-body">/ {cap}</span>}</p>
    </div>
  )
}
