import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch } from '../lib/api'

const PREVIEW_BASE = 'https://api.automationgini.com/templates/preview?id='

function TemplateSlider({ title, items, selectedId, onSelect }) {
  const scrollRef = useRef(null)

  function scrollBy(amount) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{title}</p>
        {items.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollBy(-280)}
              aria-label={`Scroll ${title} left`}
              className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-navy hover:border-slate-300 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(280)}
              aria-label={`Scroll ${title} right`}
              className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-navy hover:border-slate-300 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1">
        {items.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`snap-start flex-shrink-0 w-64 cursor-pointer border rounded-xl overflow-hidden transition-colors ${selectedId === t.id ? 'border-blue ring-2 ring-blue/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div className="relative w-64 h-40 overflow-hidden bg-slate-50">
              <iframe
                src={PREVIEW_BASE + t.id}
                title={t.name}
                loading="lazy"
                tabIndex={-1}
                sandbox="allow-same-origin"
                className="absolute top-0 left-0 w-[1280px] h-[800px] origin-top-left scale-[0.2] border-0 pointer-events-none"
              />
            </div>
            <div className="p-3">
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
          </div>
        ))}
        {items.length === 0 && <p className="font-body text-xs text-slate-400 py-2">Loading templates...</p>}
      </div>
    </div>
  )
}

export default function TemplateGallery({ selectedId, onSelect }) {
  const [templates, setTemplates] = useState({ normal: [], modern: [] })

  useEffect(() => { apiFetch('/templates').then(setTemplates).catch(() => {}) }, [])

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="font-body font-semibold text-navy mb-1">Template</p>
      <p className="font-body text-xs text-slate-400 mb-4">Browse sample pages (with placeholder text) to see each template's actual style before choosing.</p>
      <TemplateSlider title="Normal Architecture" items={templates.normal} selectedId={selectedId} onSelect={onSelect} />
      <TemplateSlider title="Modern Architecture" items={templates.modern} selectedId={selectedId} onSelect={onSelect} />
      {!selectedId && <p className="text-xs font-body text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-1">No template selected — a default style will be used.</p>}
    </div>
  )
}
