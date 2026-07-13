import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '../lib/api'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('No session token found in the link.')
      return
    }
    setToken(token)
    navigate('/dashboard', { replace: true })
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center">
        {error ? (
          <>
            <p className="font-body text-white/80 mb-2">{error}</p>
            <a href="https://automationgini-website.onrender.com/login" className="text-blue-light underline">
              Back to login
            </a>
          </>
        ) : (
          <p className="font-body text-white/70">Signing you in...</p>
        )}
      </div>
    </div>
  )
}
