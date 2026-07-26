import { useEffect, useState } from 'react'
import { listAvailability, replaceAvailability } from '../lib/portalApi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function PortalAvailability() {
  const [windows, setWindows] = useState(DAYS.map((_, i) => ({ day_of_week: i, enabled: false, start_time: '09:00', end_time: '17:00' })))
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listAvailability()
      .then((rows) => {
        setWindows((prev) => prev.map((w) => {
          const match = rows.find((r) => r.day_of_week === w.day_of_week)
          return match ? { ...w, enabled: true, start_time: match.start_time.slice(0, 5), end_time: match.end_time.slice(0, 5) } : w
        }))
      })
      .catch((e) => setStatus(e.message))
      .finally(() => setLoading(false))
  }, [])

  function updateDay(day, field, value) {
    setWindows((prev) => prev.map((w) => (w.day_of_week === day ? { ...w, [field]: value } : w)))
  }

  async function save() {
    const enabledWindows = windows.filter((w) => w.enabled)
    for (const w of enabledWindows) {
      if (w.start_time >= w.end_time) { setStatus(`${DAYS[w.day_of_week]}: start time must be before end time.`); return }
    }
    setSaving(true)
    setStatus('')
    try {
      await replaceAvailability(enabledWindows.map((w) => ({ day_of_week: w.day_of_week, start_time: w.start_time, end_time: w.end_time })))
      setStatus('Saved!')
    } catch (e) {
      setStatus(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="font-body text-slate">Loading...</p>

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Business Hours</h1>
      <p className="font-body text-slate mb-6">When customers can book online. Turn off a day to close it entirely.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        {windows.map((w) => (
          <div key={w.day_of_week} className="flex items-center gap-4">
            <label className="flex items-center gap-2 w-32 font-body text-sm font-semibold text-navy cursor-pointer">
              <input type="checkbox" checked={w.enabled} onChange={(e) => updateDay(w.day_of_week, 'enabled', e.target.checked)} className="accent-blue" />
              {DAYS[w.day_of_week]}
            </label>
            {w.enabled ? (
              <div className="flex items-center gap-2">
                <input type="time" value={w.start_time} onChange={(e) => updateDay(w.day_of_week, 'start_time', e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 font-body" />
                <span className="font-body text-sm text-slate-400">to</span>
                <input type="time" value={w.end_time} onChange={(e) => updateDay(w.day_of_week, 'end_time', e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 font-body" />
              </div>
            ) : (
              <span className="font-body text-sm text-slate-400">Closed</span>
            )}
          </div>
        ))}
      </div>

      {status && <p className="font-body text-sm text-slate mt-4">{status}</p>}
      <button onClick={save} disabled={saving} className="mt-4 font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-5 py-2.5 transition-colors">
        {saving ? 'Saving...' : 'Save Hours'}
      </button>
    </div>
  )
}
