import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTrips } from '../hooks/useTrips'
import { isOwnerEmail } from '../firebase'
import { colors, fonts } from '../theme'
import { Globe, Plus, Upload } from 'lucide-react'
import WorldMap from './WorldMap'
import NewTripForm from './NewTripForm'
import StatusBadge from '../components/StatusBadge'

export default function Landing() {
  const { user, signOut } = useAuth()
  const { trips, loading } = useTrips(user)
  const navigate = useNavigate()
  const [showNewTrip, setShowNewTrip] = useState(false)
  const canCreate = user && isOwnerEmail(user.email)

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${colors.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Globe size={24} color={colors.accent} />
          <div>
            <h1 style={{
              fontFamily: fonts.heading,
              fontSize: 20,
              fontWeight: 700,
              color: colors.text,
              letterSpacing: 0.5,
              lineHeight: 1.2,
            }}>
              Francese Family
            </h1>
            <span style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: 3,
              color: colors.textDim,
              textTransform: 'uppercase',
            }}>
              Travel Dashboard
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {canCreate && (
            <button
              onClick={() => setShowNewTrip(true)}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.textMuted,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: fonts.body,
              }}
            >
              <Plus size={14} style={{ verticalAlign: -2, marginRight: 2 }} /> New Trip
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.textMuted,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: fonts.body,
              }}
            >
              <Upload size={14} style={{ verticalAlign: -2, marginRight: 2 }} /> Import
            </button>
          )}
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${colors.border}` }}
            />
          )}
          <button
            onClick={signOut}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textDark,
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Map */}
      <div style={{ padding: '32px 24px 16px' }}>
        <WorldMap trips={trips} />
      </div>

      {/* Trip cards */}
      <div style={{ padding: '0 24px 48px', maxWidth: 900, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: colors.textDim }}>Loading trips...</div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: colors.textDim }}>
            No trips yet. {canCreate ? 'Create your first trip!' : 'Ask Michael or Meghan for access.'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320, 1fr))',
            gap: 16,
          }}>
            {trips.map(trip => (
              <div
                key={trip.slug}
                onClick={() => navigate(`/trip/${trip.slug}`)}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 8,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: `3px solid ${trip.color || colors.accent}`,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = colors.cardHover
                  e.currentTarget.style.borderColor = colors.cardBorderActive
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = colors.card
                  e.currentTarget.style.borderColor = colors.cardBorder
                  e.currentTarget.style.borderLeftColor = trip.color || colors.accent
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{trip.emoji || ''}</span>
                    <h3 style={{
                      fontFamily: fonts.heading,
                      fontSize: 17,
                      fontWeight: 600,
                      color: colors.text,
                    }}>
                      {trip.title}
                    </h3>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
                <div style={{
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  color: colors.textDim,
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}>
                  {trip.dates}
                </div>
                {trip.description && (
                  <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5, marginBottom: 8 }}>
                    {trip.description}
                  </p>
                )}
                {trip.travelers && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {trip.travelers.map(t => (
                      <span key={t} style={{
                        padding: '2px 8px',
                        background: '#1a1a2e',
                        borderRadius: 12,
                        fontSize: 10,
                        color: colors.textDim,
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewTrip && <NewTripForm onClose={() => setShowNewTrip(false)} />}
    </div>
  )
}
