import { useState } from 'react'
import { colors, fonts } from '../theme'
import StatusBadge from './StatusBadge'
import InfoRow from './InfoRow'

const categoryIcons = {
  flight: '✈',
  car: '🚗',
  hotel: '🏨',
  show: '🎭',
  train: '🚄',
  attraction: '🎡',
  dining: '🍽',
  transport: '🚌',
}

export default function BookingCard({ booking }) {
  const [expanded, setExpanded] = useState(false)
  const icon = categoryIcons[booking.category] || '📋'

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${expanded ? colors.cardBorderActive : colors.cardBorder}`,
      borderRadius: 8,
      marginBottom: 8,
      transition: 'border-color 0.15s ease',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          cursor: 'pointer',
        }}
        onMouseOver={e => e.currentTarget.style.background = colors.cardHover}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 2,
          }}>
            {booking.label}
          </div>
          {booking.detail && (
            <div style={{ fontSize: 11, color: colors.textMuted }}>{booking.detail}</div>
          )}
        </div>
        <StatusBadge status={booking.status} label={booking.confirmation} />
        <span style={{
          fontSize: 14,
          color: colors.textDim,
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease',
          flexShrink: 0,
        }}>
          ▶
        </span>
      </div>

      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: 12,
        }}>
          {booking.carrier && <InfoRow label="Carrier" value={booking.carrier} />}
          {booking.date && <InfoRow label="Date" value={booking.date} />}
          {booking.time && <InfoRow label="Time" value={booking.time} />}
          {booking.duration && <InfoRow label="Duration" value={booking.duration} />}
          {booking.cost && <InfoRow label="Cost" value={booking.cost} mono />}
          {booking.paidWith && <InfoRow label="Payment" value={booking.paidWith} />}
          {booking.passengers && <InfoRow label="Passengers" value={booking.passengers} />}
          {booking.confirmation && <InfoRow label="Confirmation" value={booking.confirmation} mono status={booking.status} />}
          {booking.notes && (
            <div style={{
              marginTop: 8,
              padding: '8px 12px',
              background: '#1a1a2a',
              borderRadius: 4,
              fontSize: 11,
              color: colors.textMuted,
              lineHeight: 1.6,
            }}>
              {booking.notes}
            </div>
          )}
          {booking.alertNotes && booking.alertNotes.length > 0 && (
            <div style={{
              marginTop: 8,
              padding: '8px 12px',
              background: 'rgba(232, 197, 92, 0.08)',
              border: '1px solid rgba(232, 197, 92, 0.2)',
              borderRadius: 4,
            }}>
              {booking.alertNotes.map((note, i) => (
                <div key={i} style={{
                  fontSize: 11,
                  color: '#e8c55c',
                  lineHeight: 1.6,
                  display: 'flex',
                  gap: 6,
                }}>
                  <span>⚠</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
