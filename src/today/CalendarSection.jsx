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

export default function CalendarSection({ events }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={SECTION_HEADER}>📅 Today</div>
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
  const timed = events.filter(e => !e.all_day).sort((a, b) => {
    return (a.time_str || '').localeCompare(b.time_str || '')
  })
  const sorted = [...allDay, ...timed]

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>📅 Today</div>
      <div style={{ padding: '0 20px' }}>
        {sorted.map((event, i) => (
          <div key={event.id || i}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 0',
            }}>
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
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  color: colors.text,
                  lineHeight: 1.3,
                }}>
                  {event.summary}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
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
                    <span style={{
                      fontSize: 11,
                      color: colors.textDim,
                    }}>
                      📍 {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {i < sorted.length - 1 && (
              <div style={{ height: 1, background: colors.divider }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
