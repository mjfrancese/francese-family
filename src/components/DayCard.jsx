import { colors, fonts } from '../theme'
import StatusBadge from './StatusBadge'
import DetailSection from './DetailSection'
import { renderBullets } from './Bullet'

export default function DayCard({ day, dayNum, month, title, events = [], details = [], expanded, onToggle }) {
  const hasDetails = details && details.length > 0

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${expanded ? colors.cardBorderActive : colors.cardBorder}`,
      borderRadius: 8,
      marginBottom: 8,
      transition: 'border-color 0.15s ease',
    }}>
      {/* Header row */}
      <div
        onClick={hasDetails ? onToggle : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          cursor: hasDetails ? 'pointer' : 'default',
          transition: 'background 0.15s ease',
        }}
        onMouseOver={e => { if (hasDetails) e.currentTarget.style.background = colors.cardHover }}
        onMouseOut={e => { if (hasDetails) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Day badge */}
        <div style={{
          minWidth: 52,
          textAlign: 'center',
          padding: '8px 4px',
          background: '#1a1a2e',
          borderRadius: 6,
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.textDim, textTransform: 'uppercase' }}>
            {day}
          </div>
          <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>
            {dayNum}
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.textDim, textTransform: 'uppercase' }}>
            {month}
          </div>
        </div>

        {/* Title + events preview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 6,
          }}>
            {title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {events.slice(0, expanded ? events.length : 4).map((evt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: colors.textMuted }}>
                {evt.time && (
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, minWidth: 56, flexShrink: 0 }}>
                    {evt.time}
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>{evt.text}</span>
                {evt.status && <StatusBadge status={evt.status} label={evt.statusLabel} />}
              </div>
            ))}
            {!expanded && events.length > 4 && (
              <div style={{ fontSize: 10, color: colors.textDark }}>+{events.length - 4} more...</div>
            )}
          </div>
        </div>

        {/* Chevron */}
        {hasDetails && (
          <span style={{
            fontSize: 14,
            color: colors.textDim,
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}>
            ▶
          </span>
        )}
      </div>

      {/* Expanded detail sections */}
      {expanded && hasDetails && (
        <div style={{
          padding: '0 16px 16px 82px',
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: 16,
          background: 'linear-gradient(180deg, #12121f 0%, transparent 100%)',
        }}>
          {details.map((section, i) => (
            <DetailSection key={i} icon={section.icon} title={section.title} color={section.color}>
              {renderBullets(section.items || section.bullets)}
            </DetailSection>
          ))}
        </div>
      )}
    </div>
  )
}
