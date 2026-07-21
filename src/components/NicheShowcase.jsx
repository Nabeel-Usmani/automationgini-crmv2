import Reveal from './Reveal'

const niches = [
  { label: 'Plumbing', url: 'https://images.pexels.com/photos/16552856/pexels-photo-16552856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Dental', url: 'https://images.pexels.com/photos/9951402/pexels-photo-9951402.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Landscaping', url: 'https://images.pexels.com/photos/20728277/pexels-photo-20728277.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'HVAC', url: 'https://images.pexels.com/photos/5504709/pexels-photo-5504709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Restaurants', url: 'https://images.pexels.com/photos/30795870/pexels-photo-30795870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Auto Repair', url: 'https://images.pexels.com/photos/26605672/pexels-photo-26605672.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Hair Salons', url: 'https://images.pexels.com/photos/27165073/pexels-photo-27165073.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Fitness', url: 'https://images.pexels.com/photos/4218662/pexels-photo-4218662.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Roofing', url: 'https://images.pexels.com/photos/9396159/pexels-photo-9396159.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Electrician', url: 'https://images.pexels.com/photos/3970340/pexels-photo-3970340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Cleaning', url: 'https://images.pexels.com/photos/30465649/pexels-photo-30465649.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Pest Control', url: 'https://images.pexels.com/photos/35607121/pexels-photo-35607121.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Real Estate', url: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Law Firms', url: 'https://images.pexels.com/photos/25651531/pexels-photo-25651531.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Veterinary', url: 'https://images.pexels.com/photos/34098612/pexels-photo-34098612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Chiropractic', url: 'https://images.pexels.com/photos/20860595/pexels-photo-20860595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Photography', url: 'https://images.pexels.com/photos/10972243/pexels-photo-10972243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Catering', url: 'https://images.pexels.com/photos/8696560/pexels-photo-8696560.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Moving Services', url: 'https://images.pexels.com/photos/37614689/pexels-photo-37614689.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { label: 'Pool Service', url: 'https://images.pexels.com/photos/6858673/pexels-photo-6858673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
]

function Card({ n }) {
  return (
    <div className="group relative w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shrink-0">
      <img
        src={n.url}
        alt={n.label}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/0 to-navy/0" />
      <span className="absolute bottom-4 left-4 font-body font-semibold text-white text-base tracking-tight">
        {n.label}
      </span>
    </div>
  )
}

export default function NicheShowcase() {
  // Duplicate the list so the CSS animation can loop seamlessly from -50% back to 0.
  const track = [...niches, ...niches]

  return (
    <section className="bg-ice py-28 md:py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal className="max-w-2xl mb-16 md:mb-20">
          <p className="font-mono text-xs tracking-widest text-blue uppercase mb-3">Real businesses, every day</p>
          <h2 className="font-display font-semibold text-4xl md:text-6xl text-navy tracking-tight leading-[1.02]">
            Built for whatever your leads actually are.
          </h2>
          <p className="mt-6 font-body text-lg text-slate leading-relaxed max-w-xl">
            Plumbers, dentists, landscapers, restaurants, and 16 more — the pipeline adapts the
            demo, the copy, and the design to whatever niche a lead falls into automatically.
          </p>
        </Reveal>
      </div>

      {/* Full-bleed auto-scrolling marquee, edge-faded so it reads as continuous */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-ice to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-ice to-transparent z-10" />
        <div className="flex gap-5 marquee-track hover:[animation-play-state:paused]">
          {track.map((n, i) => (
            <Card key={n.label + i} n={n} />
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          width: max-content;
          animation: marquee-scroll 55s linear infinite;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  )
}
