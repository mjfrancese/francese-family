import { Link } from 'react-router-dom'
import { colors, fonts } from '../theme'

const SECTION_HEADER = {
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: colors.textDim,
  fontFamily: fonts.body,
  fontWeight: 600,
  padding: '20px 20px 8px',
}

function formatTripDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TripCountdowns({ countdowns }) {
  if (!countdowns || countdowns.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>✈️ Trip Countdowns</div>
      <div style={{ padding: '0 20px' }}>
        {countdowns.map((trip) => (
          <Link
            key={trip.slug}
            to={`/trip/${trip.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>✈️</span>
                  <span style={{
                    fontSize: 15, fontWeight: 700,
                    color: colors.text, fontFamily: fonts.body,
                  }}>
                    {trip.name}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: colors.accent }}>
                    {trip.days_remaining}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    days
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: colors.textDim, marginBottom: 10 }}>
                {formatTripDate(trip.date)}
              </div>
              {trip.open_items != null && (
                <div>
                  <div style={{
                    height: 6, background: '#1a1a2a',
                    borderRadius: 3, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, trip.open_items)}%`,
                      background: trip.open_items > 50
                        ? colors.status.missing.color
                        : trip.open_items > 20
                        ? colors.status.pending.color
                        : colors.status.booked.color,
                      borderRadius: 3,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{
                    fontSize: 10, color: colors.textDim,
                    marginTop: 4, textAlign: 'right',
                  }}>
                    {trip.open_items} open items
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
