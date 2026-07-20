import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const NAV_SECTIONS = [
  { label: 'Home', icon: '🏠', path: '/dashboard', flat: true },
  {
    label: 'Leads', icon: '🗺️',
    children: [
      { label: 'Map Leads', path: '/leads/map' },
      { label: 'Premium Leads', path: '/leads/premium' },
      { label: 'Archived Leads', path: '/leads/archived' },
    ],
  },
  {
    label: 'Demo Center', icon: '🎬',
    children: [
      { label: 'Voice Demo', path: '/demo/voice' },
      { label: 'Website Mockup', path: '/demo/website' },
      { label: 'Chatbot Demo', path: '/demo/chatbot' },
      { label: 'App Mockup', path: '/demo/app-mockup' },
    ],
  },
  {
    label: 'Build Center', icon: '🔨',
    children: [
      { label: 'Voice Agent', path: '/build/voice' },
      { label: 'Website', path: '/build/website' },
      { label: 'Chatbot', path: '/build/chatbot' },
    ],
  },
  { label: 'Run New Search', icon: '🔍', path: '/search', flat: true },
  { label: 'Messenger', icon: '💬', path: '/messenger', flat: true, comingSoon: true },
  { label: 'Email Automation', icon: '✉️', path: '/email-automation', flat: true, comingSoon: true },
]

export default function Sidebar({ user }) {
  const [openSection, setOpenSection] = useState('Leads')
  const navigate = useNavigate()
  const isAgencyTier = user?.plan_name === 'Agency'
  const isPlatformOwner = !!user?.is_platform_owner

  const sections = [...NAV_SECTIONS]
  if (isAgencyTier && user?.role === 'admin') {
    sections.push({ label: 'Manage Agents', icon: '👥', path: '/manage-agents', flat: true })
  }
  if (isPlatformOwner) {
    sections.push({ label: 'Platform Admin', icon: '🛡️', path: '/platform-owner', flat: true })
  }

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <span className="font-display font-semibold text-lg text-navy">⚡ AutomationGini</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {sections.map((section) => {
          if (section.flat) {
            return (
              <NavLink
                key={section.label}
                to={section.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue/10 text-blue' : 'text-slate hover:bg-slate-50 hover:text-navy'
                  }`
                }
              >
                <span>{section.icon}</span>
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
                className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg font-body text-sm font-medium text-slate hover:bg-slate-50 hover:text-navy transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span>{section.icon}</span>
                  {section.label}
                </span>
                <span className={`text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
              </button>
              {isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {section.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
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
              )}
            </div>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="font-body text-sm font-semibold text-navy truncate">{user?.full_name}</p>
        <p className="font-mono text-xs text-slate-400 mb-2">{user?.plan_name} plan</p>
        {user?.plan_name !== 'Agency' && (
          <button
            onClick={() => navigate('/account?tab=plan')}
            className="w-full flex items-center justify-center gap-1.5 font-body font-semibold text-xs text-white bg-gradient-to-r from-amber to-blue rounded-lg py-2 hover:opacity-90 transition-opacity"
          >
            🚀 Upgrade Plan
          </button>
        )}
      </div>
    </aside>
  )
}
