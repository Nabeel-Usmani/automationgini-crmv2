import { useState } from 'react'
import { apiFetch } from '../lib/api'

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
const REUSE_LABELS = ['Very unlikely', 'Unlikely', 'Not sure', 'Likely', 'Very likely']

function ScaleInput({ value, onChange, labels }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          title={labels[n - 1]}
          className={`flex-1 h-11 rounded-lg font-body font-semibold text-sm border transition-colors ${
            value === n
              ? 'bg-navy text-white border-navy'
              : 'bg-white text-slate border-slate-200 hover:border-navy/30'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default function SurveyModal({ trigger, onComplete }) {
  const [rating, setRating] = useState(null)
  const [likelyToReuse, setLikelyToReuse] = useState(null)
  const [willingnessToPay, setWillingnessToPay] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = rating && likelyToReuse

  async function submit() {
    if (!canSubmit) {
      setError('Please answer both rating questions before continuing.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await apiFetch('/survey/submit', {
        method: 'POST',
        body: JSON.stringify({
          trigger_type: trigger,
          rating,
          likely_to_reuse: likelyToReuse,
          willingness_to_pay: willingnessToPay ? parseFloat(willingnessToPay) : null,
        }),
      })
      onComplete()
    } catch (e) {
      setError(e.message || 'Something went wrong submitting your response.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-7 shadow-2xl">
        <p className="font-mono text-[11px] uppercase tracking-wide text-blue mb-1">
          Quick feedback {trigger === 'logout' ? 'before you go' : 'to get started'}
        </p>
        <h2 className="font-display font-semibold text-xl text-navy mb-1">
          Help us improve AutomationGini
        </h2>
        <p className="font-body text-sm text-slate mb-6">
          Three quick questions — this helps us build the right thing.
        </p>

        <div className="space-y-5">
          <div>
            <p className="font-body font-semibold text-sm text-navy mb-2">
              How would you rate AutomationGini so far?
            </p>
            <ScaleInput value={rating} onChange={setRating} labels={RATING_LABELS} />
          </div>

          <div>
            <p className="font-body font-semibold text-sm text-navy mb-2">
              How likely are you to keep using it?
            </p>
            <ScaleInput value={likelyToReuse} onChange={setLikelyToReuse} labels={REUSE_LABELS} />
          </div>

          <div>
            <p className="font-body font-semibold text-sm text-navy mb-2">
              What would you be willing to pay per month for this? (optional)
            </p>
            <div className="flex items-center gap-2">
              <span className="font-body text-slate">$</span>
              <input
                type="number"
                min="0"
                value={willingnessToPay}
                onChange={(e) => setWillingnessToPay(e.target.value)}
                placeholder="e.g. 50"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
            </div>
          </div>
        </div>

        {error && <p className="font-body text-xs text-red-600 mt-4">{error}</p>}

        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          className="w-full mt-6 font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-50 rounded-lg py-3 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
