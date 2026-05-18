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

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 9999
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 9999
  let h = parseInt(m[1]), mn = parseInt(m[2]), period = m[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + mn
}

function getEventBorderColor(label) {
  if (!label) return colors.accent    // Michael's own: accent blue
  const l = label.toLowerCase()
  if (l.includes('meghan')) return null        // Meghan's: no border, muted
  if (l.includes('st. tim') || l.includes('stim') || l.includes('vestry')) return '#e8c55c'  // amber
  if (l.includes('family')) return '#5ce892'  // green
  return colors.accent
}

function getEventTextOpacity(label) {
  if (label && label.toLowerCase().includes('meghan')) return 0.65
  return 1
}

function getMapsUrl(location) {
  return `https://maps.apple.com/?q=${encodeURIComponent(location)}`
}

function EventRow({ event, isLast }) {
  const borderColor = getEventBorderColor(event.label)
  const opacity = getEventTextOpacity(event.label)

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 0',
      }}>
        {/* Left border indicator */}
        <div style={{
          width: 3,
          alignSelf: 'stretch',
          background: borderColor || 'transparent',
          borderRadius: 2,
          marginRight: 12,
          flexShrink: 0,
        }} />

        <div style={{ minWidth: 54, flexShrink: 0 }}>
          {event.all_day ? (
            <span style={{
              fontSize: 10,
              color: colors.textDim,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              All day
            </span>
          ) : (
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.accent,
              fontFamily: fonts.body,
            }}>
              {event.time_str}
            </span>
          )}
        </div>

        <div style={{ flex: 1, opacity }}>
          <div style={{
            fontSize: 14,
            color: colors.text,
            lineHeight: 1.3,
          }}>
            {event.summary}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {event.label && (
              <span style={{
                fontSize: 11,
                color: colors.textDim,
                fontStyle: 'italic',
              }}>
                {event.label}
              </span>
            )}
            {event.location && (
              <a
                href={getMapsUrl(event.location)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: colors.accent,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                📍 {event.location}
              </a>
            )}
          </div>
        </div>
      </div>
      {!isLast && <div style={{ height: 1, background: colors.divider, marginLeft: 15 }} />}
    </div>
  )
}

export default function CalendarSection({ events, viewerKey }) {
  const displayName = viewerKey === 'meghan' ? 'Meghan' : 'Michael'

  if (!events || events.length === 0) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={SECTION_HEADER}>📅 Your Day</div>
        <div style={{
          padding: '8px 20px 16px',
          fontSize: 13,
          color: colors.textDim,
          fontStyle: 'italic',
        }}>
          Nothing scheduled today
        </div>
      </div>
    )
  }

  const allDay = events.filter(e => e.all_day)
  const timed = events.filter(e => !e.all_day).sort((a, b) =>
    parseTimeToMinutes(a.time_str) - parseTimeToMinutes(b.time_str)
  )
  const sorted = [...allDay, ...timed]

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>📅 Your Day</div>
      <div style={{ padding: '0 20px' }}>
        {sorted.map((event, i) => (
          <EventRow
            key={event.id || i}
            event={event}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
