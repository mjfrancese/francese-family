import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginPage from './auth/LoginPage'
import Landing from './landing/Landing'
import TripDashboard from './trip/TripDashboard'
import ImportTool from './admin/ImportTool'
import { isOwnerEmail } from './firebase'
import { colors } from './theme'

function ProtectedRoute({ children, ownerOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.textDim, fontSize: 13 }}>Loading...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (ownerOnly && !isOwnerEmail(user.email)) return <Navigate to="/" replace />

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.textDim, fontSize: 13 }}>Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Landing /> : <LoginPage />} />
      <Route path="/trip/:slug" element={
        <ProtectedRoute><TripDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute ownerOnly><ImportTool /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
