import Nav from '../components/Nav'
import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import Pipeline from '../components/Pipeline'
import Features from '../components/Features'
import NicheShowcase from '../components/NicheShowcase'
import Upsells from '../components/Upsells'
import TeamSection from '../components/TeamSection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="font-body">
      <Nav />
      <Hero />
      <TrustBar />
      <Pipeline />
      <Features />
      <NicheShowcase />
      <Upsells />
      <TeamSection />
      <CTASection />
      <Footer />
    </div>
  )
}
