import { useState } from 'react'
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

function TomorrowEventRow({ event, isLast }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '8px 0',
      }}>
        <div style={{
          width: 3,
          alignSelf: 'stretch',
          background: colors.accent,
          borderRadius: 2,
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: colors.text, lineHeight: 1.3 }}>
            {event.summary}
          </div>
          {event.location && (
            <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>
              📍 {event.location}
            </div>
          )}
        </div>
      </div>
      {!isLast && <div style={{ height: 1, background: colors.divider, marginLeft: 15 }} />}
    </div>
  )
}

export default function TomorrowPreview({ data, viewerKey }) {
  const [expanded, setExpanded] = useState(false)

  const tomorrow = data?.tomorrow
  const viewerTomorrow = tomorrow?.[viewerKey]
  const events = viewerTomorrow?.events || []
  const household = viewerTomorrow?.household || []
  const dinnerTomorrow = data?.dinners?.tomorrow

  const allDay = events.filter(e => e.all_day)
  const timed = events.filter(e => !e.all_day).sort((a, b) =>
    parseTimeToMinutes(a.time_str) - parseTimeToMinutes(b.time_str)
  )
  const sortedEvents = [...allDay, ...timed]

  const tomorrowDate = tomorrow?.date
  const tomorrowDayName = tomorrow?.day_name

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          ...SECTION_HEADER,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ flex: 1 }}>🌅 Tomorrow</span>
        <span style={{
          marginRight: 20,
          fontSize: 14,
          color: colors.textDim,
          transition: 'transform 0.15s',
          display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>›</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 12px' }}>
          {/* Date subtitle */}
          {tomorrowDate && (
            <div style={{
              fontSize: 11,
              color: colors.textDim,
              marginBottom: 12,
              letterSpacing: '0.05em',
            }}>
              {tomorrowDayName ? `${tomorrowDayName}, ` : ''}{tomorrowDate}
            </div>
          )}

          {/* Events */}
          {sortedEvents.length > 0 ? (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12,
              padding: '4px 16px',
              marginBottom: 10,
            }}>
              {sortedEvents.map((event, i) => (
                <TomorrowEventRow
                  key={event.id || i}
                  event={event}
                  isLast={i === sortedEvents.length - 1}
                />
              ))}
            </div>
          ) : (
            <div style={{
              fontSize: 13,
              color: colors.textDim,
              fontStyle: 'italic',
              marginBottom: 10,
            }}>
              Nothing scheduled tomorrow
            </div>
          )}

          {/* Household items */}
          {household.length > 0 && (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12,
              padding: '10px 16px',
              marginBottom: 10,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              {household.map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: colors.textMuted }}>
                  {item.emoji && `${item.emoji} `}{item.label || item}
                </span>
              ))}
            </div>
          )}

          {/* Dinner plan */}
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 14 }}>🍽️</span>
            {dinnerTomorrow?.meal ? (
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, color: colors.text }}>{dinnerTomorrow.meal}</span>
                {dinnerTomorrow.cook && (
                  <span style={{ fontSize: 12, color: colors.textDim, marginLeft: 8 }}>
                    · {dinnerTomorrow.cook}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: colors.textDim, fontStyle: 'italic' }}>
                No plan yet — add one
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
