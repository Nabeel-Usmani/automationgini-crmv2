import EmptyState from '../../components/EmptyState'

export default function PremiumLeads() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Premium Leads</h1>
      <p className="font-body text-slate mb-6">Pre-enriched, confidence-scored contacts — powered by our upcoming Snov.io integration.</p>
      <EmptyState
        icon="💎"
        title="No premium leads yet"
        subtitle="Once the Snov.io integration goes live, leads found through this feature will appear here — pre-enriched contacts with confidence-scored emails, ready to act on the moment they land."
      />
    </div>
  )
}
