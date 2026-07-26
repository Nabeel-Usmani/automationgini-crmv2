import { useEffect, useMemo, useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react'
import { listAppointments, createAppointment, cancelAppointment, listServices } from '../lib/portalApi'
import EmptyState from '../components/EmptyState'

function localDateKey(isoString, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(isoString))
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${map.year}-${map.month}-${map.day}`
}

function localTimeLabel(isoString, tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(isoString))
}

function todayKey(tz) {
  return localDateKey(new Date().toISOString(), tz)
}

function shiftDateKey(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

export default function PortalAgenda({ staff }) {
  const tz = staff.timezone
  const [selectedDate, setSelectedDate] = useState(() => todayKey(tz))
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState('')

  function load() {
    setLoading(true)
    Promise.all([listAppointments(), listServices()])
      .then(([a, s]) => { setAppointments(a || []); setServices(s || []) })
      .catch((e) => setStatus(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const dayAppointments = useMemo(
    () => appointments
      .filter((a) => a.status !== 'cancelled' && localDateKey(a.starts_at, tz) === selectedDate)
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [appointments, selectedDate, tz],
  )

  async function handleCancel(id) {
    try {
      await cancelAppointment(id)
      load()
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate((d) => shiftDateKey(d, -1))} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-navy hover:border-slate-300 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[10rem]">
            <p className="font-display font-semibold text-navy">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <button onClick={() => setSelectedDate(todayKey(tz))} className="font-mono text-[11px] uppercase tracking-wide text-blue hover:underline">Today</button>
          </div>
          <button onClick={() => setSelectedDate((d) => shiftDateKey(d, 1))} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-navy hover:border-slate-300 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 font-body font-semibold text-sm text-white bg-navy hover:bg-blue rounded-lg px-4 py-2 transition-colors">
          <Plus size={14} /> New Appointment
        </button>
      </div>

      {showForm && (
        <NewAppointmentForm
          services={services}
          defaultDate={selectedDate}
          onCancel={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load() }}
        />
      )}

      {status && <p className="font-body text-sm text-red-600 mb-4">{status}</p>}

      {loading ? (
        <p className="font-body text-slate">Loading...</p>
      ) : dayAppointments.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments this day" subtitle="New bookings from your customers or staff will show up here." />
      ) : (
        <div className="space-y-3">
          {dayAppointments.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body font-semibold text-navy">{localTimeLabel(a.starts_at, tz)} · {a.service_name}</p>
                <p className="font-body text-sm text-slate">
                  {a.customer_name}{a.customer_phone ? ` · ${a.customer_phone}` : ''}{a.customer_email ? ` · ${a.customer_email}` : ''}
                </p>
                {a.notes && <p className="font-body text-xs text-slate-400 mt-1">{a.notes}</p>}
                <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.source === 'public_booking' ? 'bg-blue/10 text-blue' : 'bg-slate-100 text-slate-500'}`}>
                  {a.source === 'public_booking' ? 'Booked online' : 'Added by staff'}
                </span>
              </div>
              <button onClick={() => handleCancel(a.id)} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline">
                <X size={12} /> Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NewAppointmentForm({ services, defaultDate, onCancel, onCreated }) {
  const activeServices = services.filter((s) => s.active)
  const [serviceId, setServiceId] = useState(activeServices[0]?.id || '')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('09:00')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!serviceId) { setStatus('Add a service first.'); return }
    if (!customerName.trim()) { setStatus('Customer name is required.'); return }
    setSaving(true)
    setStatus('')
    try {
      await createAppointment({
        service_id: Number(serviceId), customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null, customer_phone: customerPhone.trim() || null,
        starts_at: `${date}T${time}:00`, notes: notes.trim() || null,
      })
      onCreated()
    } catch (err) {
      setStatus(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body">
          {activeServices.length === 0 && <option value="">No services yet</option>}
          {activeServices.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email (optional)" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
        <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone (optional)" className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
      </div>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 font-body" />
      {status && <p className="font-body text-sm text-red-600">{status}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="font-body font-semibold text-sm text-white bg-navy hover:bg-blue disabled:opacity-60 rounded-lg px-4 py-2 transition-colors">
          {saving ? 'Saving...' : 'Add Appointment'}
        </button>
        <button type="button" onClick={onCancel} className="font-body text-sm text-slate">Cancel</button>
      </div>
    </form>
  )
}
