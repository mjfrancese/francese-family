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

const CARD_STYLE = {
  background: colors.card,
  border: `1px solid ${colors.cardBorder}`,
  borderRadius: 12,
  padding: 16,
  marginBottom: 10,
  marginLeft: 20,
  marginRight: 20,
}

const KID_EMOJIS = { louise: '🎵', kenna: '⭐' }
const KID_NAMES = { louise: 'Louise', kenna: 'Kenna' }
const OTHER_PERSON = { michael: 'meghan', meghan: 'michael' }
const DISPLAY_NAMES = { michael: 'Michael', meghan: 'Meghan' }

const CONFIDENCE_COLORS = {
  high: colors.status.booked.color,
  medium: colors.status.pending.color,
  low: colors.textDim,
  flipped: colors.status.pending.color,
  ask: colors.textDim,
}

function LogisticsCard({ eventId, entry, kid, onConfirm }) {
  const { event_summary, time_str, location, proposed_person, confidence,
    conflict_reason, confirmed, confirmed_person } = entry

  return (
    <div style={{
      ...CARD_STYLE,
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 8,
    }}>
      <div style={{ marginBottom: 10 }}>
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
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: colors.status.booked.color,
          fontSize: 13,
          fontWeight: 600,
        }}>
          ✓ {DISPLAY_NAMES[confirmed_person] || confirmed_person}
        </div>
      ) : proposed_person === 'ask' ? (
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Who's taking {KID_NAMES[kid]}?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onConfirm(kid, eventId, 'michael')}
              style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: colors.accent, border: 'none',
                color: '#fff', fontFamily: fonts.body, fontSize: 14,
                fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
              }}
            >
              Michael
            </button>
            <button
              onClick={() => onConfirm(kid, eventId, 'meghan')}
              style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: colors.card, border: `1px solid ${colors.cardBorder}`,
                color: colors.text, fontFamily: fonts.body, fontSize: 14,
                fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
              }}
            >
              Meghan
            </button>
          </div>
        </div>
      ) : (
        <div>
          {confidence === 'flipped' && conflict_reason && (
            <div style={{
              fontSize: 12, color: colors.status.pending.color,
              background: colors.status.pending.bg,
              border: `1px solid ${colors.status.pending.border}`,
              borderRadius: 6, padding: '6px 10px', marginBottom: 8,
            }}>
              ⚠️ {conflict_reason}
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 8, fontSize: 12, color: colors.textMuted,
          }}>
            Suggested:
            <span style={{ color: CONFIDENCE_COLORS[confidence] || colors.textMuted, fontWeight: 600 }}>
              {DISPLAY_NAMES[proposed_person] || proposed_person}
            </span>
            <span style={{ color: colors.textDim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ({confidence})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onConfirm(kid, eventId, proposed_person)}
              style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: colors.accent, border: 'none',
                color: '#fff', fontFamily: fonts.body, fontSize: 14,
                fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
              }}
            >
              ✓ {DISPLAY_NAMES[proposed_person] || proposed_person}
            </button>
            <button
              onClick={() => onConfirm(kid, eventId, OTHER_PERSON[proposed_person] || 'ask')}
              style={{
                flex: 1, minHeight: 44, borderRadius: 8,
                background: '#1a1a28', border: `1px solid ${colors.cardBorder}`,
                color: colors.textMuted, fontFamily: fonts.body, fontSize: 14,
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
            >
              Switch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function KidBlock({ kidKey, kidData, onConfirm }) {
  const logistics = kidData?.logistics || {}
  const logisticsEntries = Object.entries(logistics)
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
        {logisticsEntries.map(([eventId, entry]) => (
          <LogisticsCard
            key={eventId}
            eventId={eventId}
            entry={entry}
            kid={kidKey}
            onConfirm={onConfirm}
          />
        ))}
      </div>
    </div>
  )
}

export default function KidsSection({ kids, onConfirm }) {
  if (!kids) return null
  const kidsWithLogistics = Object.entries(kids).filter(
    ([, kidData]) => kidData?.logistics && Object.keys(kidData.logistics).length > 0
  )
  if (kidsWithLogistics.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>👧 Kids Logistics</div>
      {kidsWithLogistics.map(([kidKey, kidData]) => (
        <KidBlock key={kidKey} kidKey={kidKey} kidData={kidData} onConfirm={onConfirm} />
      ))}
    </div>
  )
}
