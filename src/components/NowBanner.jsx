import { colors, fonts } from '../theme'
import { Navigation, CalendarClock, PartyPopper, ChevronDown } from 'lucide-react'

// Strip HTML tags so detail text reads cleanly in the compact banner.
function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, '').trim()
}

// Pull the most useful heads-up items from a day's detail sections AND its
// Build-Your-Own plan option notes (warnings first).
function dayHeadsUp(day, max = 3) {
  const items = []
  for (const section of day?.details || []) {
    for (const it of section.items || []) {
      if (it.type === 'warn') items.push(stripHtml(it.text))
    }
  }
  for (const slot of day?.plan?.slots || []) {
    for (const opt of slot.options || []) {
      for (const note of opt.notes || []) {
        if (note.type === 'warn') items.push(stripHtml(note.text))
      }
    }
    for (const note of slot.notes || []) {
      if (note.type === 'warn') items.push(stripHtml(note.text))
    }
  }
  return items.slice(0, max)
}

const wrap = {
  background: 'linear-gradient(180deg, #15152a 0%, #121220 100%)',
  border: `1px solid ${colors.cardBorderActive}`,
  borderRadius: 10,
  padding: '14px 16px',
  marginBottom: 16,
}

const kicker = {
  fontFamily: fonts.mono,
  fontSize: 10,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: colors.accent,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 8,
}

export default function NowBanner({ clock, onJumpToday }) {
  if (!clock || !clock.enabled) return null

  // ---- Upcoming: countdown -------------------------------------------------
  if (clock.status === 'upcoming') {
    const d = clock.daysUntilStart
    const first = clock.nextDay?.raw
    return (
      <div style={wrap}>
        <div style={kicker}><CalendarClock size={12} /> Trip not started</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.text }}>
          {d === 0 ? 'Starts today' : d === 1 ? 'Starts tomorrow' : `${d} days to go`}
        </div>
        {first && (
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
            First up · {first.day} {first.dayNum} {first.month} — {first.title}
          </div>
        )}
      </div>
    )
  }

  // ---- Complete ------------------------------------------------------------
  if (clock.status === 'complete') {
    return (
      <div style={wrap}>
        <div style={{ ...kicker, color: colors.bullet.tip }}><PartyPopper size={12} /> Trip complete</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.text }}>
          Welcome home 🏠
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
          Every day's done. Tap any day below to relive it.
        </div>
      </div>
    )
  }

  // ---- Active: you-are-here ------------------------------------------------
  if (clock.status !== 'active' || !clock.today) return null
  const today = clock.today.raw
  const cur = clock.currentItem
  const next = clock.nextItem
  const heads = dayHeadsUp(today)

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={kicker}>
          <Navigation size={12} /> You are here · Day {clock.todayIndex + 1} of {clock.total}
        </div>
        {clock.localTime && (
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, whiteSpace: 'nowrap' }}>
            {clock.localTime}{clock.localZone ? ` · ${clock.localZone}` : ''}
          </div>
        )}
      </div>

      <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
        {today.day} {today.dayNum} {today.month} — {today.title}
      </div>

      {/* Now / next */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {cur && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: colors.text }}>
            <span style={{ ...pill, background: '#1a3a2a', border: '1px solid #2d6b45', color: colors.bullet.tip }}>NOW</span>
            <span style={{ flex: 1, fontStyle: cur.chosen ? 'normal' : 'italic', opacity: cur.chosen ? 1 : 0.7 }}>
              {cur.time ? <strong style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, marginRight: 6 }}>{cur.time}</strong> : null}
              {stripHtml(cur.text)}
            </span>
          </div>
        )}
        {next && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: colors.textMuted }}>
            <span style={{ ...pill, background: '#3a2e1a', border: '1px solid #6b5a2d', color: colors.bullet.warn }}>
              {clock.nextIsTomorrow ? 'NEXT DAY' : 'NEXT'}
            </span>
            <span style={{ flex: 1, fontStyle: next.chosen ? 'normal' : 'italic', opacity: next.chosen ? 1 : 0.7 }}>
              {next.time ? <strong style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, marginRight: 6 }}>{next.time}</strong> : null}
              {stripHtml(next.text)}
            </span>
          </div>
        )}
        {!cur && !next && (
          <div style={{ fontSize: 12, color: colors.textDim }}>Nothing scheduled right now — enjoy.</div>
        )}
      </div>

      {/* Today's heads-up (warnings) */}
      {heads.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.divider}` }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, color: colors.bullet.warn, textTransform: 'uppercase', marginBottom: 5 }}>
            Heads-up today
          </div>
          {heads.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11.5, color: colors.textMuted, marginBottom: 3, lineHeight: 1.45 }}>
              <span style={{ color: colors.bullet.warn, flexShrink: 0 }}>⚠</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}

      {onJumpToday && (
        <button onClick={onJumpToday} style={jumpBtn}>
          <ChevronDown size={12} /> Jump to today
        </button>
      )}
    </div>
  )
}

const pill = {
  fontFamily: fonts.mono,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  padding: '1px 6px',
  borderRadius: 4,
  flexShrink: 0,
  marginTop: 1,
}

const jumpBtn = {
  marginTop: 10,
  background: 'none',
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  color: colors.textMuted,
  fontFamily: fonts.body,
  fontSize: 12,
  padding: '8px 14px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}
