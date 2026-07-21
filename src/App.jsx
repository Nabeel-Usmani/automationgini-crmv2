import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Layout from './components/Layout'
import MapLeads from './pages/leads/MapLeads'
import PremiumLeads from './pages/leads/PremiumLeads'
import ArchivedLeads from './pages/leads/ArchivedLeads'
import Account from './pages/Account'
import VoiceDemo from './pages/demo/VoiceDemo'
import WebsiteDemo from './pages/demo/WebsiteDemo'
import ChatbotDemo from './pages/demo/ChatbotDemo'
import AppMockupDemo from './pages/demo/AppMockupDemo'
import BuildVoiceAgent from './pages/build/VoiceAgent'
import BuildWebsite from './pages/build/Website'
import BuildChatbot from './pages/build/Chatbot'
import Search from './pages/Search'
import Billing from './pages/Billing'
import PlatformOwnerDashboard from './pages/PlatformOwnerDashboard'
import AgencyOwners from './pages/AgencyOwners'
import AdminSettings from './pages/AdminSettings'
import ComingSoon from './pages/ComingSoon'
import ChatWidget from './components/ChatWidget'

function wrap(Component) {
  return <Layout>{(user) => <Component user={user} />}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/platform-owner" element={<PlatformOwnerDashboard />} />
        <Route path="/platform-owner/agency-owners" element={<AgencyOwners />} />
        <Route path="/platform-owner/admin-settings" element={<AdminSettings />} />
        <Route path="/platform-admin" element={<Navigate to="/platform-owner" replace />} />
        <Route path="/messenger" element={<Layout>{() => <ComingSoon icon="💬" title="Messenger" />}</Layout>} />
        <Route path="/email-automation" element={<Layout>{() => <ComingSoon icon="✉️" title="Email Automation" />}</Layout>} />
        <Route path="/dashboard" element={wrap(Home)} />
        <Route path="/leads/map" element={wrap(MapLeads)} />
        <Route path="/leads/premium" element={wrap(PremiumLeads)} />
        <Route path="/leads/archived" element={wrap(ArchivedLeads)} />
        <Route path="/account" element={wrap(Account)} />
        <Route path="/demo/voice" element={wrap(VoiceDemo)} />
        <Route path="/demo/website" element={wrap(WebsiteDemo)} />
        <Route path="/demo/chatbot" element={wrap(ChatbotDemo)} />
        <Route path="/demo/app-mockup" element={wrap(AppMockupDemo)} />
        <Route path="/build/voice" element={wrap(BuildVoiceAgent)} />
        <Route path="/build/website" element={wrap(BuildWebsite)} />
        <Route path="/build/chatbot" element={wrap(BuildChatbot)} />
        <Route path="/search" element={wrap(Search)} />
        <Route path="/billing" element={wrap(Billing)} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  )
}
