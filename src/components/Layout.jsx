import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import UserMenu from './UserMenu'
import { getMe, getToken } from '../lib/api'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getToken()) {
      window.location.href = 'https://automationgini-website.onrender.com/login'
      return
    }
    getMe().then(setUser).catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-red-600">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-slate">Loading your account...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
          <UserMenu user={user} />
        </header>
        <main className="flex-1">{typeof children === 'function' ? children(user) : children}</main>
      </div>
    </div>
  )
}
