import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useFamilyStatus } from '../hooks/useFamilyStatus'
import { useTrips } from '../hooks/useTrips'
import { colors, fonts } from '../theme'
import { Globe, LogOut, ChevronRight } from 'lucide-react'
import LiturgicalBanner from '../today/LiturgicalBanner'

const STATUS_CONFIG = {
  'on-track':        { color: '#5ce892', bg: '#1a3a2a', border: '#2d6b45', emoji: '✓', summary: 'Family is on track' },
  'needs-attention': { color: '#e8c55c', bg: '#3a2e1a', border: '#6b5a2d', emoji: '○', summary: 'One thing needs attention' },
  'action-required': { color: '#e85c5c', bg: '#3a1a1a', border: '#6b2d2d', emoji: '!', summary: 'Action needed' },
}

function ActionCard({ area, areaKey }) {
  const [snoozed, setSnoozed] = useState(false)
  if (!area || area.status === 'on-track' || snoozed) return null
  const cfg = STATUS_CONFIG[area.status] || STATUS_CONFIG['needs-attention']

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: '16px 18px',
      marginBottom: 12,
    }}>
      <div style={{
        fontSize: 11,
        fontFamily: fonts.mono,
        color: cfg.color,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {area.label}
      </div>
      <p style={{
        fontSize: 14,
        color: colors.textMuted,
        fontFamily: fonts.body,
        lineHeight: 1.6,
        margin: '0 0 12px',
      }}>
        {area.message}
      </p>
      <button
        onClick={() => setSnoozed(true)}
        style={{
          background: 'none',
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          color: colors.textDim,
          fontSize: 11,
          cursor: 'pointer',
          padding: '5px 12px',
          fontFamily: fonts.body,
        }}
      >
        Got it — check later
      </button>
    </div>
  )
}

export default function MeghanHome() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { status, overallColor, overallLabel, loading } = useFamilyStatus()
  const { trips } = useTrips(user)

  const upcomingTrip = trips.find(t => t.status !== 'completed' && t.status !== 'cancelled')
  const cfg = STATUS_CONFIG[status?.overall] || STATUS_CONFIG['needs-attention']

  const actionAreas = status?.areas
    ? Object.entries(status.areas).filter(([, a]) => a.status !== 'on-track')
    : []

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: `1px solid ${colors.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe size={18} color="#a78bfa" />
          <span style={{
            fontFamily: fonts.heading,
            fontSize: 17,
            fontWeight: 700,
            color: colors.text,
          }}>
            Francese Family
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
          )}
          <button onClick={signOut} style={{
            background: 'none', border: 'none',
            color: colors.textDark, cursor: 'pointer',
          }}>
            <LogOut size={13} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 20px 60px' }}>

        {/* Liturgical banner */}
        <LiturgicalBanner />

        {/* Family status card */}
        {!loading && status && (
          <div style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: 12,
            padding: '18px 20px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, color: cfg.color }}>{cfg.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.text,
                  fontFamily: fonts.body,
                  marginBottom: 2,
                }}>
                  {cfg.summary}
                </div>
                {upcomingTrip && (
                  <div style={{ fontSize: 12, color: colors.textDim, fontFamily: fonts.body }}>
                    {upcomingTrip.title} coming up · {upcomingTrip.dates}
                  </div>
                )}
              </div>
              {upcomingTrip && (
                <ChevronRight
                  size={16}
                  color={colors.textDark}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/trip/${upcomingTrip.slug}`)}
                />
              )}
            </div>
          </div>
        )}

        {/* Action cards — one per area needing attention */}
        {actionAreas.map(([key, area]) => (
          <ActionCard key={key} area={area} areaKey={key} />
        ))}

        {/* Trip quick-link */}
        {upcomingTrip && (
          <div
            onClick={() => navigate(`/trip/${upcomingTrip.slug}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #1a1a30 0%, #141420 100%)',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 10,
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 28 }}>{upcomingTrip.icon || '✈️'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: fonts.body }}>
                {upcomingTrip.title}
              </div>
              <div style={{ fontSize: 12, color: colors.textDim, fontFamily: fonts.mono }}>
                {upcomingTrip.dates} · Tap to view itinerary
              </div>
            </div>
            <ChevronRight size={16} color={colors.textDark} />
          </div>
        )}

        {/* All trips link */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '10px',
            background: 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.textDim,
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: fonts.body,
          }}
        >
          View all trips
        </button>
      </div>
    </div>
  )
}
