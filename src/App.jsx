import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginPage from './auth/LoginPage'
import Landing from './landing/Landing'
import TripDashboard from './trip/TripDashboard'
import ImportTool from './admin/ImportTool'
import TodayDashboard from './today/TodayDashboard'
import ProjectsReview from './today/ProjectsReview'
import SummerCalendar from './summer/SummerCalendar'
import Dashboard from './dashboard/Dashboard'
import Ambient from './dashboard/Ambient'
import MeghanHome from './home/MeghanHome'
import KennaView from './kenna/KennaView'
import Kitchen from './kitchen/Kitchen'
import { isOwnerEmail, getHomeRouteForEmail } from './firebase'
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

  // After login, redirect based on who is signing in
  const homeRoute = user ? getHomeRouteForEmail(user.email) : '/'

  return (
    <Routes>
      {/* Root: redirect logged-in users to their home view */}
      <Route path="/" element={user ? <Navigate to={homeRoute} replace /> : <LoginPage />} />

      {/* Michael */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/ambient" element={<Ambient />} />

      {/* Meghan */}
      <Route path="/home" element={
        <ProtectedRoute><MeghanHome /></ProtectedRoute>
      } />

      {/* Kenna */}
      <Route path="/kenna" element={
        <ProtectedRoute><KennaView /></ProtectedRoute>
      } />

      {/* Kitchen — no auth, kiosk mode */}
      <Route path="/kitchen" element={<Kitchen />} />

      {/* Shared — trips, calendar, admin */}
      <Route path="/landing" element={
        <ProtectedRoute><Landing /></ProtectedRoute>
      } />
      <Route path="/today" element={
        <ProtectedRoute><TodayDashboard /></ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute><ProjectsReview /></ProtectedRoute>
      } />
      <Route path="/trip/:slug" element={
        <ProtectedRoute><TripDashboard /></ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute><SummerCalendar /></ProtectedRoute>
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
