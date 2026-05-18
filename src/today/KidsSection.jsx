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

const KID_EMOJIS = { louise: '🎵', kenna: '⭐' }
const KID_NAMES = { louise: 'Louise', kenna: 'Kenna' }
const DISPLAY_NAMES = { michael: 'Michael', meghan: 'Meghan' }

// Check if two times are "close" (within 90 minutes)
function timesAreClose(timeA, timeB) {
  if (!timeA || !timeB) return false
  function toMinutes(t) {
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!m) return -1
    let h = parseInt(m[1]), mn = parseInt(m[2]), period = m[3].toUpperCase()
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return h * 60 + mn
  }
  const a = toMinutes(timeA), b = toMinutes(timeB)
  if (a < 0 || b < 0) return false
  return Math.abs(a - b) <= 90
}

function ConflictWarning({ text }) {
  return (
    <div style={{
      background: '#3a2e1a',
      border: `1px solid #6b5a2d`,
      borderRadius: 8,
      padding: '8px 12px',
      marginBottom: 10,
      fontSize: 12,
      color: '#e8c55c',
      lineHeight: 1.5,
    }}>
      ⚠️ {text}
    </div>
  )
}

function TransportCard({ eventId, entry, kid, onConfirm, conflictWarning }) {
  const { event_summary, time_str, location, proposed_person, confirmed, confirmed_person } = entry

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: colors.textDim,
        marginBottom: 8,
      }}>
        🚗 Getting there
      </div>

      {conflictWarning && <ConflictWarning text={conflictWarning} />}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, color: colors.text, fontWeight: 600, marginBottom: 2 }}>
          {event_summary}
        </div>
        {time_str && (
          <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600 }}>{time_str}</div>
        )}
        {location && (
          <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>{location}</div>
        )}
      </div>

      {confirmed ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: colors.status.booked.color, fontSize: 13, fontWeight: 600,
        }}>
          ✓ {DISPLAY_NAMES[confirmed_person] || confirmed_person} is driving
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Who's driving {KID_NAMES[kid]}?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onConfirm(kid, eventId, 'michael')}
              style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: proposed_person === 'michael' ? colors.accent : '#1a1a28',
                border: proposed_person === 'michael' ? 'none' : `1px solid ${colors.cardBorder}`,
                color: proposed_person === 'michael' ? '#fff' : colors.textMuted,
                fontFamily: fonts.body, fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Michael
            </button>
            <button
              onClick={() => onConfirm(kid, eventId, 'meghan')}
              style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: proposed_person === 'meghan' ? colors.accent : '#1a1a28',
                border: proposed_person === 'meghan' ? 'none' : `1px solid ${colors.cardBorder}`,
                color: proposed_person === 'meghan' ? '#fff' : colors.textMuted,
                fontFamily: fonts.body, fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Meghan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AttendanceCard({ eventId, entry, kid, onConfirm, conflictWarning }) {
  const { event_summary, time_str, location, confirmed, confirmed_person } = entry

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: colors.textDim,
        marginBottom: 8,
      }}>
        👀 Who's going?
      </div>

      {conflictWarning && <ConflictWarning text={conflictWarning} />}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, color: colors.text, fontWeight: 600, marginBottom: 2 }}>
          {event_summary}
        </div>
        {time_str && (
          <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600 }}>{time_str}</div>
        )}
        {location && (
          <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>{location}</div>
        )}
      </div>

      {confirmed ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: colors.status.booked.color, fontSize: 13, fontWeight: 600,
        }}>
          ✓ {
            confirmed_person === 'both' ? 'Both going' :
            confirmed_person === 'neither' ? 'Neither (declined)' :
            (DISPLAY_NAMES[confirmed_person] || confirmed_person) + ' is going'
          }
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Who's attending {event_summary}?
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['michael', 'meghan', 'both', 'neither'].map(opt => (
              <button
                key={opt}
                onClick={() => onConfirm(kid, eventId, opt)}
                style={{
                  flex: '1 1 auto', minHeight: 40, borderRadius: 8,
                  background: '#1a1a28',
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textMuted,
                  fontFamily: fonts.body, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                  minWidth: 70,
                }}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KidBlock({ kidKey, kidData, onConfirm, allCalendar }) {
  const logistics = kidData?.logistics || {}
  const logisticsEntries = Object.entries(logistics).filter(([, e]) => !e.confirmed)
  if (logisticsEntries.length === 0) return null

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: colors.text,
        padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {KID_EMOJIS[kidKey]} {KID_NAMES[kidKey]}
      </div>
      <div style={{ padding: '0 20px' }}>
        {logisticsEntries.map(([eventId, entry]) => {
          // Build conflict warning: check if either parent has an event close in time
          let conflictWarning = null
          if (allCalendar && entry.time_str) {
            const closeEvent = allCalendar.find(e =>
              !e.all_day && e.time_str && timesAreClose(e.time_str, entry.time_str) &&
              e.summary !== entry.event_summary
            )
            if (closeEvent) {
              const who = closeEvent.label?.toLowerCase().includes('meghan') ? 'Meghan' : 'Michael'
              conflictWarning = `Heads up: ${who} has ${closeEvent.summary} at ${closeEvent.time_str} — this is close to ${entry.time_str}`
            }
          }

          const logisticsType = entry.logistics_type || 'transport'

          if (logisticsType === 'attendance') {
            return (
              <AttendanceCard
                key={eventId}
                eventId={eventId}
                entry={entry}
                kid={kidKey}
                onConfirm={onConfirm}
                conflictWarning={conflictWarning}
              />
            )
          }

          return (
            <TransportCard
              key={eventId}
              eventId={eventId}
              entry={entry}
              kid={kidKey}
              onConfirm={onConfirm}
              conflictWarning={conflictWarning}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function KidsSection({ kids, todayDate, allCalendar, onConfirm }) {
  if (!kids) return null
  const kidsWithPendingLogistics = Object.entries(kids).filter(
    ([, kidData]) => kidData?.logistics &&
      Object.values(kidData.logistics).some(e => !e.confirmed)
  )
  if (kidsWithPendingLogistics.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>👧 Kids Logistics</div>
      {kidsWithPendingLogistics.map(([kidKey, kidData]) => (
        <KidBlock
          key={kidKey}
          kidKey={kidKey}
          kidData={kidData}
          onConfirm={onConfirm}
          allCalendar={allCalendar}
        />
      ))}
    </div>
  )
}
