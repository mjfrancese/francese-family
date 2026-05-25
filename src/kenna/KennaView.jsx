import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTrips } from '../hooks/useTrips'
import { colors, fonts } from '../theme'
import { Globe, ChevronRight, LogOut } from 'lucide-react'

const TABS = ['Trip', 'My Week', 'Tonight']

export default function KennaView() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { trips } = useTrips(user)
  const [tab, setTab] = useState('Trip')

  const upcomingTrip = trips.find(t => t.status !== 'completed' && t.status !== 'cancelled')

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
          <Globe size={18} color="#fbbf24" />
          <span style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: colors.text }}>
            Francese Family
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
          )}
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: colors.textDark, cursor: 'pointer' }}>
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.divider}`,
        overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? `2px solid #fbbf24` : '2px solid transparent',
              color: tab === t ? colors.text : colors.textDim,
              fontFamily: fonts.body,
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 20px 60px' }}>

        {/* TRIP TAB */}
        {tab === 'Trip' && (
          <div>
            {upcomingTrip ? (
              <div>
                {/* Hero trip card */}
                <div
                  onClick={() => navigate(`/trip/${upcomingTrip.slug}`)}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a30 0%, #141420 100%)',
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: 12,
                    padding: '20px',
                    cursor: 'pointer',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{upcomingTrip.icon || '✈️'}</div>
                  <div style={{ fontSize: 22, fontFamily: fonts.heading, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                    {upcomingTrip.title}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 14 }}>
                    {upcomingTrip.dates}
                  </div>
                  {upcomingTrip.description && (
                    <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, margin: '0 0 14px' }}>
                      {upcomingTrip.description}
                    </p>
                  )}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '8px 14px',
                    background: '#fbbf2422',
                    border: '1px solid #fbbf2444',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#fbbf24',
                    fontFamily: fonts.body,
                  }}>
                    See the full itinerary <ChevronRight size={12} />
                  </div>
                </div>

                {/* Other trips */}
                {trips.filter(t => t.slug !== upcomingTrip.slug && t.status !== 'completed').map(trip => (
                  <div
                    key={trip.slug}
                    onClick={() => navigate(`/trip/${trip.slug}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: colors.card,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{trip.icon || '✈️'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, fontFamily: fonts.body }}>{trip.title}</div>
                      <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono }}>{trip.dates}</div>
                    </div>
                    <ChevronRight size={14} color={colors.textDark} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: colors.textDim }}>No upcoming trips yet.</div>
            )}
          </div>
        )}

        {/* MY WEEK TAB */}
        {tab === 'My Week' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textDim }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 14, fontFamily: fonts.body, lineHeight: 1.6 }}>
              Your personal calendar will appear here once<br />Google Calendar sync is set up.
            </div>
          </div>
        )}

        {/* TONIGHT TAB */}
        {tab === 'Tonight' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textDim }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🍝</div>
            <div style={{ fontSize: 14, fontFamily: fonts.body, lineHeight: 1.6 }}>
              Dinner and who's home tonight will show up here<br />once the household feed is wired in.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
