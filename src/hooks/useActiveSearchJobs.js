import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

const STORAGE_KEY = 'ag_active_search_jobs'

function readStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

// Called by Search.jsx right after /search/run succeeds, so any page (Map
// Leads included, even after a full page navigation) can pick up the same
// jobs and show real progress instead of a fake timer.
export function trackSearchJobs(newJobs) {
  const merged = [...readStored(), ...newJobs]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}

// Polls /search/status for whatever jobs are currently tracked (shared across
// tabs/pages via localStorage) and returns their live status. Calls
// onLeadsIncreased() whenever any job's leads_found goes up, so callers can
// refresh their own lead list without the user having to click anything.
export default function useActiveSearchJobs(onLeadsIncreased) {
  const [jobs, setJobs] = useState([])
  const lastFoundRef = useRef({})
  const onLeadsIncreasedRef = useRef(onLeadsIncreased)
  onLeadsIncreasedRef.current = onLeadsIncreased

  useEffect(() => {
    let cancelled = false
    let pollTimer = null

    function poll() {
      const stored = readStored()
      if (stored.length === 0) {
        if (!cancelled) setJobs([])
        return
      }
      const ids = stored.map((j) => j.search_id).join(',')
      apiFetch(`/search/status?ids=${encodeURIComponent(ids)}`).then((statuses) => {
        if (cancelled) return
        const byId = Object.fromEntries((statuses || []).map((s) => [s.search_id, s]))
        const merged = stored.map((j) => ({ ...j, ...byId[j.search_id] }))
        setJobs(merged)

        let increased = false
        merged.forEach((j) => {
          const prev = lastFoundRef.current[j.search_id] ?? 0
          if ((j.leads_found ?? 0) > prev) increased = true
          lastFoundRef.current[j.search_id] = j.leads_found ?? 0
        })
        if (increased && onLeadsIncreasedRef.current) onLeadsIncreasedRef.current()

        const stillRunning = merged.filter((j) => j.status === 'running')
        if (stillRunning.length === 0) {
          localStorage.removeItem(STORAGE_KEY)
        } else {
          pollTimer = setTimeout(poll, 4000)
        }
      }).catch(() => {
        pollTimer = setTimeout(poll, 4000)
      })
    }

    poll()
    return () => { cancelled = true; clearTimeout(pollTimer) }
  }, [])

  return jobs
}
