import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useLoops } from '../hooks/useLoops'
import { useSequences } from '../hooks/useSequences'
import { useFamilyStatus } from '../hooks/useFamilyStatus'
import { useTrips } from '../hooks/useTrips'
import { colors, fonts } from '../theme'
import { Globe, Monitor, LogOut } from 'lucide-react'
import FamilyStatusPill from '../components/FamilyStatusPill'
import OpenLoopsBoard from '../components/OpenLoopsBoard'
import SequenceTracker from '../components/SequenceTracker'
import TripCountdowns from '../today/TripCountdowns'
import ProjectPulse from '../today/ProjectPulse'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { openLoops, doneLoops, loading: loopsLoading, markDone, markOpen } = useLoops()
  const { list: sequences, loading: seqLoading } = useSequences()
  const { status, overallColor, overallLabel, loading: statusLoading } = useFamilyStatus()
  const { trips } = useTrips(user)

  const upcomingTrips = trips
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .slice(0, 4)

  const allLoops = [...openLoops, ...doneLoops]

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        borderBottom: `1px solid ${colors.divider}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: colors.bg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Globe size={20} color={colors.accent} />
          <div>
            <div style={{
              fontFamily: fonts.heading,
              fontSize: 17,
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.2,
            }}>
              Francese Family
            </div>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: 3,
              color: colors.textDim,
              textTransform: 'uppercase',
            }}>
              System Dashboard
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!statusLoading && status && (
            <FamilyStatusPill
              overall={status.overall}
              compact
            />
          )}
          <button
            onClick={() => navigate('/ambient')}
            title="Ambient panel"
            style={{
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.textDim,
              cursor: 'pointer',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontFamily: fonts.body,
            }}
          >
            <Monitor size={13} /> Ambient
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.textDim,
              cursor: 'pointer',
              padding: '6px 10px',
              fontSize: 11,
              fontFamily: fonts.body,
            }}
          >
            Trips
          </button>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          )}
          <button onClick={signOut} style={{
            background: 'none', border: 'none',
            color: colors.textDark, fontSize: 11, cursor: 'pointer', fontFamily: fonts.body,
          }}>
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Family status expanded */}
        {!statusLoading && status && (
          <FamilyStatusPill
            overall={status.overall}
            message={null}
            areas={status.areas}
          />
        )}

        {/* Two-column layout on wide screens */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'start',
        }}>

          {/* Left column: loops + sequences */}
          <div>
            {!loopsLoading && (
              <OpenLoopsBoard
                loops={allLoops}
                onMarkDone={markDone}
                onMarkOpen={markOpen}
              />
            )}
            {!seqLoading && (
              <SequenceTracker sequences={sequences} />
            )}
          </div>

          {/* Right column: projects + trips */}
          <div>
            {/* Trip countdowns */}
            {upcomingTrips.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontFamily: fonts.heading,
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.text,
                  margin: '0 0 12px',
                  letterSpacing: 0.3,
                }}>
                  Upcoming Trips
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcomingTrips.map(trip => {
                    const days = trip.dates ? (() => {
                      const match = trip.dates.match(/(\w+ \d+), (\d{4})/)
                      if (!match) return null
                      const d = new Date(`${match[1]} ${match[2]}`)
                      return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))
                    })() : null
                    return (
                      <div
                        key={trip.slug}
                        onClick={() => navigate(`/trip/${trip.slug}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          background: colors.card,
                          border: `1px solid ${colors.cardBorder}`,
                          borderLeft: `3px solid ${trip.color || colors.accent}`,
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{trip.icon || '✈️'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, fontFamily: fonts.body }}>
                            {trip.title}
                          </div>
                          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono }}>{trip.dates}</div>
                        </div>
                        {days !== null && (
                          <span style={{
                            fontSize: 11,
                            fontFamily: fonts.mono,
                            color: days <= 14 ? '#e8c55c' : colors.textDim,
                            fontWeight: days <= 14 ? 700 : 400,
                          }}>
                            {days <= 0 ? 'now' : `${days}d`}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Project pulse */}
            <ProjectPulse />
          </div>
        </div>
      </div>
    </div>
  )
}
