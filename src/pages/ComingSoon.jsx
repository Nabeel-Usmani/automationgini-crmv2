export default function ComingSoon({ icon: Icon, title }) {
  return (
    <div className="max-w-2xl mx-auto px-8 py-24 text-center">
      <div className="flex justify-center mb-4 text-slate-300">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h1 className="font-display font-semibold text-2xl text-navy mb-2">{title}</h1>
      <p className="font-body text-slate">Coming soon — An End to End messaging tracking for your clients will be available in V 1.0.0.</p>
    </div>
  )
}
