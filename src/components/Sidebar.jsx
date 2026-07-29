import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Home, Map, Clapperboard, Hammer, Search, MessageCircle, Mail, Share2,
  Users, Shield, ChevronRight, Rocket, X,
} from 'lucide-react'

const NAV_SECTIONS = [
  { label: 'Home', icon: Home, path: '/dashboard', flat: true },
  {
    label: 'Leads', icon: Map,
    children: [
      { label: 'Map Leads', path: '/leads/map' },
      { label: 'Premium Leads', path: '/leads/premium' },
      { label: 'Archived Leads', path: '/leads/archived' },
    ],
  },
  {
    label: 'Demo Center', icon: Clapperboard,
    children: [
      { label: 'Voice Demo', path: '/demo/voice' },
      { label: 'Website Mockup', path: '/demo/website' },
      { label: 'Chatbot Demo', path: '/demo/chatbot' },
      { label: 'App Mockup', path: '/demo/app-mockup' },
      { label: 'Business CRM', path: '/demo/business-crm' },
    ],
  },
  {
    label: 'Build Center', icon: Hammer,
    children: [
      { label: 'Voice Agent', path: '/build/voice' },
      { label: 'Website', path: '/build/website' },
      { label: 'Chatbot', path: '/build/chatbot' },
      { label: 'Business CRM', path: '/build/business-crm' },
    ],
  },
  { label: 'Run New Search', icon: Search, path: '/search', flat: true },
  { label: 'Messenger', icon: MessageCircle, path: '/messenger', flat: true, comingSoon: true },
  { label: 'Email Automation', icon: Mail, path: '/email-automation', flat: true, comingSoon: true },
  { label: 'Social Media Automation', icon: Share2, path: '/social-media-automation', flat: true, comingSoon: true },
]

function SidebarContent({ user, onNavigate }) {
  const [openSection, setOpenSection] = useState('Leads')
  const navigate = useNavigate()
  const isAgencyTier = user?.plan_name === 'Agency'
  const isPlatformOwner = !!user?.is_platform_owner

  const sections = [...NAV_SECTIONS]
  if (isAgencyTier && user?.role === 'admin') {
    sections.push({ label: 'Manage Agents', icon: Users, path: '/manage-agents', flat: true })
  }
  if (isPlatformOwner) {
    sections.push({ label: 'Platform Admin', icon: Shield, path: '/platform-owner', flat: true })
  }

  return (
    <>
      <div className="px-5 py-5 border-b border-slate-200 flex items-center gap-2">
        <img src="/logo-icon.png" alt="" className="h-7 w-auto" />
        <span className="font-display font-semibold text-lg tracking-tight text-navy">
          Automation<span className="text-amber">Gini</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          if (section.flat) {
            return (
              <NavLink
                key={section.label}
                to={section.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-body text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue/10 text-blue' : 'text-slate hover:bg-slate-50 hover:text-navy'
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} className="shrink-0" />
                {section.label}
                {section.comingSoon && (
                  <span className="ml-auto text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full px-1.5 py-0.5">Soon</span>
                )}
              </NavLink>
            )
          }
          const isOpen = openSection === section.label
          return (
            <div key={section.label}>
              <button
                onClick={() => setOpenSection(isOpen ? null : section.label)}
                className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl font-body text-sm font-medium text-slate hover:bg-slate-50 hover:text-navy transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {section.label}
                </span>
                <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={14} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-1 space-y-1 pb-1">
                      {section.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                              isActive ? 'bg-blue/10 text-blue font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="font-body text-sm font-semibold text-navy truncate">{user?.full_name}</p>
        <p className="font-mono text-xs text-slate-400 mb-2">{user?.plan_name} plan</p>
        {user?.plan_name !== 'Agency' && (
          <button
            onClick={() => { navigate('/account?tab=plan'); onNavigate?.() }}
            className="w-full flex items-center justify-center gap-1.5 font-body font-semibold text-xs text-white bg-gradient-to-r from-amber to-blue rounded-lg py-2 hover:opacity-90 transition-opacity"
          >
            <Rocket size={13} /> Upgrade Plan
          </button>
        )}
      </div>
    </>
  )
}

export default function Sidebar({ user, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200 flex-col">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile: overlay drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="lg:hidden fixed inset-0 bg-navy-deep/40 z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl"
            >
              <button
                onClick={onCloseMobile}
                className="absolute top-5 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-navy"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent user={user} onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
