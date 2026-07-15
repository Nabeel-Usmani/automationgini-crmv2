export default function PremiumLeads() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="font-display font-semibold text-2xl text-navy mb-1">Premium Leads</h1>
      <p className="font-body text-slate mb-6">Pre-enriched, confidence-scored contacts, ready to act on the moment they land.</p>

      <div className="relative overflow-hidden bg-gradient-to-br from-navy to-blue rounded-2xl py-20 px-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative">
          <div className="text-5xl mb-4 animate-pulse">💎</div>
          <p className="font-display font-semibold text-3xl text-white animate-pulse">Coming Soon</p>
          <p className="font-body text-white/70 mt-2 max-w-md mx-auto">
            We're building something great here. Premium Leads will bring you pre-enriched, ready-to-act contacts.
          </p>
        </div>
      </div>
    </div>
  )
}
