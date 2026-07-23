import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const PREVIEW_BASE = 'https://api.automationgini.com/templates/preview?id='

export default function TemplateGallery({ selectedId, onSelect }) {
  const [templates, setTemplates] = useState({ normal: [], modern: [] })

  useEffect(() => { apiFetch('/templates').then(setTemplates).catch(() => {}) }, [])

  function Section({ title, items }) {
    return (
      <div className="mb-5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mb-2">{title}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`cursor-pointer border rounded-xl p-3.5 transition-colors ${selectedId === t.id ? 'border-blue bg-blue/5' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <p className="font-body font-semibold text-sm text-navy mb-1">{t.name}</p>
              <p className="font-body text-xs text-slate mb-2 leading-snug">{t.description}</p>
              <a
                href={PREVIEW_BASE + t.id}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-blue hover:underline"
              >
                View Sample →
              </a>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="font-body font-semibold text-navy mb-1">Template</p>
      <p className="font-body text-xs text-slate-400 mb-4">Browse sample pages (with placeholder text) to see each template's actual style before choosing.</p>
      <Section title="Normal Architecture" items={templates.normal} />
      <Section title="Modern Architecture" items={templates.modern} />
      {!selectedId && <p className="text-xs font-body text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-1">No template selected — a default style will be used.</p>}
    </div>
  )
}
