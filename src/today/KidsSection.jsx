import { colors, fonts } from '../theme'
import { Music, Star, Car, Eye, Users, AlertTriangle } from 'lucide-react'

const SECTION_HEADER = {
  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: colors.textDim, fontFamily: fonts.body, fontWeight: 600,
  padding: '20px 20px 8px', display: 'flex', alignItems: 'center', gap: 6,
}

const KID_ICONS = { louise: Music, kenna: Star }
const KID_COLORS = { louise: '#f472b6', kenna: '#a78bfa' }
const KID_NAMES = { louise: 'Louise', kenna: 'Kenna' }
const DISPLAY_NAMES = { michael: 'Michael', meghan: 'Meghan' }

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
      background: '#3a2e1a', border: '1px solid #6b5a2d', borderRadius: 8,
      padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#e8c55c',
      lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 6,
    }}>
      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
      {text}
    </div>
  )
}

function TransportCard({ eventId, entry, kid, onConfirm, conflictWarning }) {
  const { event_summary, time_str, location, proposed_person, confirmed, confirmed_person } = entry

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: 12, padding: 16, marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: colors.textDim, marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Car size={13} color="#fbbf24" /> Getting there
      </div>

      {conflictWarning && <ConflictWarning text={conflictWarning} />}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, color: colors.text, fontWeight: 600, marginBottom: 2 }}>
          {event_summary}
        </div>
        {time_str && <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600 }}>{time_str}</div>}
        {location && <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>{location}</div>}
      </div>

      {confirmed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.status.booked.color, fontSize: 13, fontWeight: 600 }}>
          ✓ {DISPLAY_NAMES[confirmed_person] || confirmed_person} is driving
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Who's driving {KID_NAMES[kid]}?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['michael', 'meghan'].map(person => (
              <button key={person} onClick={() => onConfirm(kid, eventId, person)} style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: proposed_person === person ? colors.accent : '#1a1a28',
                border: proposed_person === person ? 'none' : `1px solid ${colors.cardBorder}`,
                color: proposed_person === person ? '#fff' : colors.textMuted,
                fontFamily: fonts.body, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{DISPLAY_NAMES[person]}</button>
            ))}
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
      background: colors.card, border: `1px solid ${colors.cardBorder}`,
      borderRadius: 12, padding: 16, marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: colors.textDim, marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Eye size={13} color="#60a5fa" /> Who's going?
      </div>

      {conflictWarning && <ConflictWarning text={conflictWarning} />}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, color: colors.text, fontWeight: 600, marginBottom: 2 }}>
          {event_summary}
        </div>
        {time_str && <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600 }}>{time_str}</div>}
        {location && <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>{location}</div>}
      </div>

      {confirmed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.status.booked.color, fontSize: 13, fontWeight: 600 }}>
          ✓ {confirmed_person === 'both' ? 'Both going' :
             confirmed_person === 'neither' ? 'Neither (declined)' :
             (DISPLAY_NAMES[confirmed_person] || confirmed_person) + ' is going'}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Who's attending {event_summary}?
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['michael', 'meghan', 'both', 'neither'].map(opt => (
              <button key={opt} onClick={() => onConfirm(kid, eventId, opt)} style={{
                flex: '1 1 auto', minHeight: 40, borderRadius: 8,
                background: '#1a1a28', border: `1px solid ${colors.cardBorder}`,
                color: colors.textMuted, fontFamily: fonts.body, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', minWidth: 70,
              }}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KidBlock({ kidKey, kidData, onConfirm, michaelCalendar, meghanCalendar }) {
  const logistics = kidData?.logistics || {}
  const logisticsEntries = Object.entries(logistics).filter(([, e]) => !e.confirmed)
  if (logisticsEntries.length === 0) return null

  const Icon = KID_ICONS[kidKey] || Star
  const kidColor = KID_COLORS[kidKey] || colors.text

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={16} color={kidColor} /> {KID_NAMES[kidKey]}
      </div>
      <div style={{ padding: '0 20px' }}>
        {logisticsEntries.map(([eventId, entry]) => {
          let conflictWarning = null
          if (entry.time_str) {
            const parentViews = [
              { name: 'Michael', events: michaelCalendar || [] },
              { name: 'Meghan', events: meghanCalendar || [] },
            ]
            for (const { name, events } of parentViews) {
              const close = events.find(e =>
                !e.all_day && e.time_str &&
                timesAreClose(e.time_str, entry.time_str) &&
                e.summary !== entry.event_summary
              )
              if (close) {
                conflictWarning = `Heads up: ${name} has ${close.summary} at ${close.time_str}`
                break
              }
            }
          }

          const logisticsType = entry.logistics_type || 'transport'

          if (logisticsType === 'attendance') {
            return <AttendanceCard key={eventId} eventId={eventId} entry={entry} kid={kidKey} onConfirm={onConfirm} conflictWarning={conflictWarning} />
          }

          return <TransportCard key={eventId} eventId={eventId} entry={entry} kid={kidKey} onConfirm={onConfirm} conflictWarning={conflictWarning} />
        })}
      </div>
    </div>
  )
}

export default function KidsSection({ kids, todayDate, michaelCalendar, meghanCalendar, onConfirm }) {
  if (!kids) return null
  const kidsWithPendingLogistics = Object.entries(kids).filter(
    ([, kidData]) => kidData?.logistics && Object.values(kidData.logistics).some(e => !e.confirmed)
  )
  if (kidsWithPendingLogistics.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>
        <Users size={14} color={colors.textDim} /> Kids Logistics
      </div>
      {kidsWithPendingLogistics.map(([kidKey, kidData]) => (
        <KidBlock key={kidKey} kidKey={kidKey} kidData={kidData} onConfirm={onConfirm}
          michaelCalendar={michaelCalendar} meghanCalendar={meghanCalendar} />
      ))}
    </div>
  )
}
