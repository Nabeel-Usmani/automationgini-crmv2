import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'

export default function BookingLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = `https://automationgini.com/book/${slug}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked in some contexts - the link is still
      // visible and selectable, so this is a nicety, not a hard requirement.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue hover:underline">
        <ExternalLink size={12} /> {url}
      </a>
      <button onClick={copy} className="text-slate-400 hover:text-navy">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  )
}
