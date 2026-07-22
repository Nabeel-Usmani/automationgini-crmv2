import { useEffect, useRef } from 'react'

const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000 // 20 minutes
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

/**
 * Calls onTimeout() after `timeoutMs` of no user activity (mouse, keyboard, scroll, touch).
 * Timer resets on any detected activity.
 */
export default function useInactivityTimeout(onTimeout, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const timerRef = useRef(null)

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onTimeout()
      }, timeoutMs)
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onTimeout, timeoutMs])
}
