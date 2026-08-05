import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { apiFetch } from '../lib/api'

export default function EmailPreviewModal({ sendId, onClose }) {
  const [email, setEmail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setEmail(null)
    setError('')
    apiFetch(`/email-automation/sends/${sendId}`)
      .then(setEmail)
      .catch((e) => setError(e.message || 'Could not load this email.'))
  }, [sendId])

  const subjectText = email?.subject || (error ? 'Unable to load email' : email ? 'No subject saved' : ' ')

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-[9999] px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wide text-blue mb-1">
              {email ? `To: ${email.to_email}` : 'Loading...'}
            </p>
            <p className="font-display font-semibold text-lg text-navy truncate">
              {subjectText}
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-navy p-1 -m-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">
          {error ? (
            <p className="font-body text-sm text-red-600 p-6">{error}</p>
          ) : !email ? (
            <p className="font-body text-sm text-slate p-6">Loading email...</p>
          ) : !email.html ? (
            <p className="font-body text-sm text-slate p-6">
              No saved copy of this email is available — it was sent before content logging was turned on.
            </p>
          ) : (
            <iframe
              title={`Email preview: ${email.subject}`}
              srcDoc={email.html}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              className="w-full h-[60vh] bg-white"
            />
          )}
        </div>
      </div>
    </div>
  )
}
