import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Layout from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Layout>{(user) => <Home user={user} />}</Layout>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
