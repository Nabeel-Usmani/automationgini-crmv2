import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import LeadPicker from '../../components/LeadPicker'
import EmptyState from '../../components/EmptyState'
import MetricCard from '../../components/MetricCard'
import TabButton from '../../components/TabButton'

const LANGUAGES = [
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
]

export default function VoiceDemo() {
  const [tab, setTab] = useState('new')
  const [selectedLead, setSelectedLead] = useState(null)
  const [languageCode, setLanguageCode] = useState('ar')
  const [status, setStatus] = useState('')
  const [created, setCreated] = useState([])
  const [billing, setBilling] = useState(null)

  useEffect(() => {
    apiFetch('/billing/summary').then(setBilling).catch(() => {})
    apiFetch('/demo/voice/created').then(setCreated).catch(() => {})
  }, [tab])

  async function runDemo(leadId, demoType, langCode) {
    setStatus('Starting demo...')
    try {
      await apiFetch('/demo/voice', { method: 'POST', body: JSON.stringify({ lead_id: leadId, demo_type: demoType, language_code: langCode }) })
      setStatus('Demo started — should ring within ~10-15s.')
    } catch (e) {
      setStatus(e.message)
    }
  }

  const cap = billing?.caps?.vapi_call
  const used = billing?.usage_this_month?.vapi_call ?? 0

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Voice Automation Demo</h1>
      <p className="font-body text-slate mb-6">Place a real AI voice call to show a lead what this sounds like.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Plan" value={billing?.plan_name} />
        <MetricCard label="Voice Demos Used" value={cap ? `${used} / ${cap}` : used} />
        <MetricCard label="Remaining" value={cap ? Math.max(0, cap - used) : 'Unlimited'} />
      </div>

      <div className="flex gap-2 mb-5">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>🆕 Run New Demo</TabButton>
        <TabButton active={tab === 'created'} onClick={() => setTab('created')}>📋 Demos Created</TabButton>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          <LeadPicker onSelect={setSelectedLead} requirePhone />
          {selectedLead && (
            <div className="space-y-3">
              <button onClick={() => runDemo(selectedLead.id, 'english_only', null)} className="w-full font-body font-semibold text-sm bg-white border border-slate-200 hover:border-blue rounded-lg py-3 transition-colors">🇬🇧 English Only Demo</button>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="font-body font-semibold text-sm text-navy mb-1">Bilingual Demo</p>
                <p className="font-body text-xs text-slate-400 mb-3">Caller presses 1 for their language, or 2 for English — pick which language pairs with English.</p>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => runDemo(selectedLead.id, 'bilingual', l.code)}
                      className={`flex items-center gap-2 text-sm font-semibold rounded-lg px-3 py-2.5 border transition-colors ${languageCode === l.code ? 'border-blue bg-blue/5' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {l.flag} {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {status && <p className="font-body text-sm text-slate">{status}</p>}
        </div>
      ) : created.length === 0 ? (
        <EmptyState icon="📞" title="No voice demos run yet" subtitle="Run one from the tab above to see it listed here." />
      ) : (
        <div className="space-y-3">
          {created.map((d) => (
            <div key={d.lead_id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{d.business_name}</p>
                <p className="font-body text-sm text-slate">{d.niche} · {d.city}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => runDemo(d.lead_id, 'english_only', null)} className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5">Re-run EN</button>
                <button onClick={() => runDemo(d.lead_id, 'bilingual', 'ar')} className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5">Re-run Bilingual (AR)</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
