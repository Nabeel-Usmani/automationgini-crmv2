import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MessageCircle, Mail, Share2 } from 'lucide-react'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Layout from './components/Layout'
import MapLeads from './pages/leads/MapLeads'
import OtherPlatformsLeads from './pages/leads/OtherPlatformsLeads'
import PremiumLeads from './pages/leads/PremiumLeads'
import ArchivedLeads from './pages/leads/ArchivedLeads'
import Account from './pages/Account'
import VoiceDemo from './pages/demo/VoiceDemo'
import WebsiteDemo from './pages/demo/WebsiteDemo'
import ChatbotDemo from './pages/demo/ChatbotDemo'
import AppMockupDemo from './pages/demo/AppMockupDemo'
import BusinessCrmDemo from './pages/demo/BusinessCrmDemo'
import BuildVoiceAgent from './pages/build/VoiceAgent'
import BuildWebsite from './pages/build/Website'
import BuildChatbot from './pages/build/Chatbot'
import BuildBusinessCrm from './pages/build/BusinessCrm'
import Search from './pages/Search'
import Billing from './pages/Billing'
import PlatformOwnerDashboard from './pages/PlatformOwnerDashboard'
import AgencyOwners from './pages/AgencyOwners'
import AdminSettings from './pages/AdminSettings'
import ComingSoon from './pages/ComingSoon'
import ChatWidget from './components/ChatWidget'
import PortalLogin from './portal/PortalLogin'
import PortalSetPassword from './portal/PortalSetPassword'
import PortalAuthGate from './portal/PortalAuthGate'
import PortalAgenda from './portal/PortalAgenda'
import PortalServices from './portal/PortalServices'
import PortalAvailability from './portal/PortalAvailability'

function wrap(Component) {
  return <Layout>{(user) => <Component user={user} />}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client-business staff portal - a separate login/identity from the
            agency routes below, gated by its own ag_portal_session cookie. */}
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/set-password" element={<PortalSetPassword />} />
        <Route path="/portal/agenda" element={<PortalAuthGate>{(staff) => <PortalAgenda staff={staff} />}</PortalAuthGate>} />
        <Route path="/portal/services" element={<PortalAuthGate><PortalServices /></PortalAuthGate>} />
        <Route path="/portal/availability" element={<PortalAuthGate><PortalAvailability /></PortalAuthGate>} />
        <Route path="/portal" element={<Navigate to="/portal/agenda" replace />} />

        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/platform-owner" element={<PlatformOwnerDashboard />} />
        <Route path="/platform-owner/agency-owners" element={<AgencyOwners />} />
        <Route path="/platform-owner/admin-settings" element={<AdminSettings />} />
        <Route path="/platform-admin" element={<Navigate to="/platform-owner" replace />} />
        <Route path="/messenger" element={<Layout>{() => <ComingSoon icon={MessageCircle} title="Messenger" />}</Layout>} />
        <Route path="/email-automation" element={<Layout>{() => <ComingSoon icon={Mail} title="Email Automation" />}</Layout>} />
        <Route path="/social-media-automation" element={<Layout>{() => <ComingSoon icon={Share2} title="Social Media Automation" description="Coming soon — automatically generate and publish on-brand posts across Facebook, Instagram, and LinkedIn for your clients, no manual work required." />}</Layout>} />
        <Route path="/dashboard" element={wrap(Home)} />
        <Route path="/leads/map" element={wrap(MapLeads)} />
        <Route path="/leads/other-platforms" element={wrap(OtherPlatformsLeads)} />
        <Route path="/leads/premium" element={wrap(PremiumLeads)} />
        <Route path="/leads/archived" element={wrap(ArchivedLeads)} />
        <Route path="/account" element={wrap(Account)} />
        <Route path="/demo/voice" element={wrap(VoiceDemo)} />
        <Route path="/demo/website" element={wrap(WebsiteDemo)} />
        <Route path="/demo/chatbot" element={wrap(ChatbotDemo)} />
        <Route path="/demo/app-mockup" element={wrap(AppMockupDemo)} />
        <Route path="/demo/business-crm" element={wrap(BusinessCrmDemo)} />
        <Route path="/build/voice" element={wrap(BuildVoiceAgent)} />
        <Route path="/build/website" element={wrap(BuildWebsite)} />
        <Route path="/build/chatbot" element={wrap(BuildChatbot)} />
        <Route path="/build/business-crm" element={wrap(BuildBusinessCrm)} />
        <Route path="/search" element={wrap(Search)} />
        <Route path="/billing" element={wrap(Billing)} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  )
}
