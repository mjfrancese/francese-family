import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, set, get } from 'firebase/database'
import { db } from '../firebase'
import { colors } from '../theme'
import {
  CategoryIcon, LogisticsIcon, getCategoryColor, getCategoryBg,
  getLogisticsLabel, MapPin, Clock, AlertTriangle, User,
  Calendar, Car, Eye, Plane, Flag,
} from '../components/CategoryIcon'
import { StateIcon, LandmarkIcon } from '../components/icons'

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS_ABBR = ['S','M','T','W','T','F','S']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

const PERSON_COLORS = {
  michael: '#60a5fa', meghan: '#a78bfa', kenna: '#fbbf24', louise: '#f472b6',
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Kenna Location Strip ──────────────────────────────────────────────────────

function KennaStrip({ schedule }) {
  if (!schedule || schedule.length === 0) return null
  const today = todayStr()

  const transitions = []
  for (let i = 0; i < schedule.length; i++) {
    const s = schedule[i], next = schedule[i + 1]
    if (next && s.location !== next.location)
      transitions.push({ to: next.location, date: next.start })
  }

  let currentLoc = 'unknown'
  for (const s of schedule) {
    if (s.start <= today && s.end > today) { currentLoc = s.location; break }
  }

  const upcoming = transitions.filter(t => t.date >= today).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        padding: '8px 12px', borderRadius: 10,
        background: currentLoc === 'St. Louis' ? 'rgba(52,211,153,0.08)' : 'rgba(96,165,250,0.08)',
        border: `1px solid ${currentLoc === 'St. Louis' ? 'rgba(52,211,153,0.18)' : 'rgba(96,165,250,0.18)'}`,
      }}>
        <StateIcon state={currentLoc === 'St. Louis' ? 'MO' : 'KY'} size={22}
          color={currentLoc === 'St. Louis' ? '#34d399' : '#60a5fa'} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
            Kenna is in {currentLoc === 'St. Louis' ? 'St. Louis' : 'Kentucky'}
          </div>
          {upcoming.length > 0 && (
            <div style={{ fontSize: 11, color: colors.textDim, marginTop: 1 }}>
              Next: {upcoming[0].to === 'St. Louis' ? 'returns' : 'leaves for Kentucky'}{' '}
              {new Date(upcoming[0].date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {schedule.filter(s => s.end > today).slice(0, 6).map((s, i) => {
          const isSTL = s.location === 'St. Louis'
          return (
            <div key={i} style={{
              flex: '0 0 auto', padding: '5px 10px', borderRadius: 16,
              background: isSTL ? 'rgba(52,211,153,0.06)' : 'rgba(96,165,250,0.06)',
              border: `1px solid ${isSTL ? 'rgba(52,211,153,0.15)' : 'rgba(96,165,250,0.15)'}`,
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 10,
            }}>
              <StateIcon state={isSTL ? 'MO' : 'KY'} size={12} color={isSTL ? '#34d399' : '#60a5fa'} />
              <span style={{ color: colors.textDim }}>
                {isSTL ? 'STL' : 'KY'}{' · '}
                {new Date(s.start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {'–'}
                {new Date(s.end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Trip Cards ─────────────────────────────────────────────────────────────────

function TripCards({ trips }) {
  if (!trips || trips.length === 0) return null
  const today = todayStr()
  const upcoming = trips.filter(t => t.end >= today)
  const tripIconMap = {
    'london-paris': { type: 'landmark', landmark: 'eiffel' },
    'new-hampshire-july': { type: 'state', state: 'NH' },
    'st-augustine': { type: 'state', state: 'FL' },
  }

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
      {upcoming.map((t, i) => {
        const iconConf = tripIconMap[t.slug]
        const start = new Date(t.start + 'T12:00:00')
        const end = new Date(t.end + 'T12:00:00')
        const daysUntil = Math.ceil((start - new Date()) / 86400000)
        const isActive = today >= t.start && today <= t.end
        return (
          <div key={i} style={{
            flex: '0 0 auto', minWidth: 175, padding: '10px 14px', borderRadius: 10,
            background: isActive ? 'rgba(45,212,191,0.10)' : 'rgba(45,212,191,0.06)',
            border: `1px solid ${isActive ? 'rgba(45,212,191,0.30)' : 'rgba(45,212,191,0.12)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {iconConf?.type === 'landmark' ? (
                <LandmarkIcon landmark={iconConf.landmark} size={16} color="#2dd4bf" />
              ) : iconConf?.type === 'state' ? (
                <StateIcon state={iconConf.state} size={20} color="#2dd4bf" />
              ) : (
                <Plane size={14} color="#2dd4bf" />
              )}
              <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: 12 }}>{t.label}</span>
            </div>
            <div style={{ color: colors.textDim, fontSize: 10 }}>
              {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' – '}
              {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ fontSize: 10, marginTop: 3, fontWeight: 600, color: '#2dd4bf' }}>
              {isActive ? '✈ Happening now' : daysUntil > 0 && daysUntil <= 120 ? `${daysUntil} days away` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Birthday Card ──────────────────────────────────────────────────────────────

function BirthdayCard({ event }) {
  const d = new Date(event.date + 'T12:00:00')
  const today = todayStr()
  const isToday = event.date === today
  const isPast = event.date < today
  const summary = (event.summary || '').toLowerCase()
  let color = '#9ca3af'
  for (const [k, c] of Object.entries(PERSON_COLORS)) {
    if (summary.includes(k)) { color = c; break }
  }
  const daysUntil = Math.ceil((new Date(event.date + 'T12:00:00') - new Date()) / 86400000)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px', borderRadius: 10, marginBottom: 5,
      background: isToday ? `${color}18` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isToday ? color + '50' : 'rgba(255,255,255,0.07)'}`,
      opacity: isPast ? 0.45 : 1,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0 }}>🎂</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: isToday ? color : colors.text }}>
          {event.summary}
          {isToday && <span style={{ marginLeft: 8, fontSize: 11, color }}> Today! 🎉</span>}
        </div>
        <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>
          {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
      {!isToday && !isPast && daysUntil <= 90 && (
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
          background: `${color}18`, color, flexShrink: 0,
        }}>
          {daysUntil}d
        </div>
      )}
    </div>
  )
}

// ── Day Drawer ─────────────────────────────────────────────────────────────────
// Opens when you tap a grid day cell. Shows all events for that day.

function DayDrawer({ date, eventsByDate, onClose, onEventClick }) {
  if (!date) return null
  const d = new Date(date + 'T12:00:00')
  const dayEvents = eventsByDate[date] || []
  const isToday = date === todayStr()

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: colors.card, borderRadius: '16px 16px 0 0',
        padding: '20px 16px 32px', maxWidth: 500, width: '100%',
        border: `1px solid ${colors.cardBorder}`, maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.divider, margin: '0 auto 16px' }} />

        <div style={{ fontSize: 16, fontWeight: 700, color: isToday ? '#f472b6' : colors.text, marginBottom: 14 }}>
          {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {isToday && <span style={{ fontSize: 11, marginLeft: 8, color: '#f472b6' }}>Today</span>}
        </div>

        {dayEvents.length === 0 ? (
          <div style={{ color: colors.textDim, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            Nothing scheduled
          </div>
        ) : (
          dayEvents.map((ev, i) => (
            <div key={i} onClick={() => { onClose(); setTimeout(() => onEventClick(ev), 50) }} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.cardBorder}`,
            }}>
              <CategoryIcon category={ev.category} size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{ev.summary}</div>
                {ev.time_str && <div style={{ fontSize: 11, color: colors.accent, marginTop: 2 }}>{ev.time_str}</div>}
                {ev.location && <div style={{ fontSize: 10, color: colors.textDim, marginTop: 1 }}>{ev.location.split('\n')[0]}</div>}
              </div>
              <LogisticsIcon type={ev.logistics_type} size={14} style={{ flexShrink: 0 }} />
            </div>
          ))
        )}

        <button onClick={onClose} style={{
          marginTop: 10, width: '100%', padding: '10px 0',
          background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10,
          color: colors.textDim, fontSize: 13, cursor: 'pointer', fontWeight: 500,
        }}>Close</button>
      </div>
    </div>
  )
}

// ── Month Grid ─────────────────────────────────────────────────────────────────

function MonthGrid({ year, month, eventsByDate, onDayClick, kennaSchedule, trips }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const today = todayStr()
  const HIDE_BEFORE = new Date(2026, 4, 23)

  const tripDates = new Set()
  for (const t of trips || []) {
    let d = new Date(t.start + 'T12:00:00')
    const end = new Date(t.end + 'T12:00:00')
    while (d <= end) { tripDates.add(d.toISOString().slice(0,10)); d.setDate(d.getDate()+1) }
  }

  const rows = []
  let cells = []
  for (let cell = 0; cell < totalCells; cell++) {
    if (cell % 7 === 0 && cells.length > 0) { rows.push(<tr key={rows.length}>{cells}</tr>); cells = [] }
    const dayNum = cell - firstDay + 1
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth
    const dateObj = new Date(year, month, dayNum)
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    const isToday = dateStr === today
    const isBefore = dateObj < HIDE_BEFORE
    const dayEvents = inMonth && !isBefore ? (eventsByDate[dateStr] || []) : []
    const isTrip = tripDates.has(dateStr)

    let kennaLoc = null
    for (const s of kennaSchedule || []) {
      if (s.start <= dateStr && s.end > dateStr) { kennaLoc = s.location; break }
    }

    const clickable = inMonth && !isBefore

    cells.push(
      <td key={cell} onClick={() => clickable && onDayClick(dateStr)} style={{
        verticalAlign: 'top', padding: '2px', height: 56, textAlign: 'left',
        opacity: (!inMonth || isBefore) ? 0.15 : 1,
        background: kennaLoc === 'Kentucky' && clickable
          ? 'rgba(96,165,250,0.05)'
          : isTrip && clickable ? 'rgba(45,212,191,0.06)' : 'transparent',
        border: isToday ? '1.5px solid rgba(244,114,182,0.5)' : '1px solid transparent',
        borderRadius: 6,
        cursor: clickable ? 'pointer' : 'default',
      }}>
        {inMonth && (
          <>
            <div style={{
              fontSize: 10, fontWeight: isToday ? 700 : 400, lineHeight: 1.2,
              color: isToday ? '#f472b6' : isTrip ? '#2dd4bf' : colors.textDim,
              padding: '2px 3px 1px',
            }}>
              {dayNum}
            </div>
            <div style={{ padding: '0 2px', overflow: 'hidden' }}>
              {dayEvents.slice(0, 2).map((ev, i) => (
                <div key={i} style={{
                  fontSize: 7.5, lineHeight: 1.3, borderRadius: 2,
                  padding: '0px 2px', marginBottom: 1,
                  color: getCategoryColor(ev.category),
                  background: getCategoryBg(ev.category),
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}>
                  {ev.summary
                    .replace(/ — COCA \(Louise\)/g, '')
                    .replace(/ \(Louise\)/g, '')
                    .replace(/ \(Kenna\)/g, '')
                    .replace(/Magnificent Me/, 'Mag. Me')
                    .replace(/In the Garden/, 'Garden')}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div style={{ fontSize: 7, color: colors.textDim, padding: '0 2px' }}>
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
          </>
        )}
      </td>
    )
  }
  while (cells.length < 7) cells.push(<td key={`p${cells.length}`} />)
  rows.push(<tr key={rows.length}>{cells}</tr>)

  return (
    <div style={{ background: colors.card, borderRadius: 10, padding: 10, border: `1px solid ${colors.cardBorder}` }}>
      <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
        {MONTHS_FULL[month]}
      </div>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{DAYS_ABBR.map((d,i) => (
            <th key={i} style={{ fontSize: 8, fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', paddingBottom: 4, letterSpacing: 0.5, textAlign: 'center' }}>{d}</th>
          ))}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

// ── Event Modal ────────────────────────────────────────────────────────────────

function EventModal({ event, onClose }) {
  if (!event) return null
  const catColor = getCategoryColor(event.category)
  const catBg = getCategoryBg(event.category)
  const [parentPick, setParentPick] = useState(null)
  const [cancelled, setCancelled] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [saving, setSaving] = useState(false)
  const needsDriver = event.logistics_type === 'transport' || event.logistics_type === 'attendance'

  useEffect(() => {
    if (!needsDriver || !event._id) return
    get(ref(db, `logistics/confirmations/${event.date}/${event._id}`)).then(snap => {
      const d = snap.val()
      if (d?.cancelled) { setCancelled(true); setCancelReason(d.cancel_reason || '') }
      else if (d?.confirmed_person) setParentPick(d.confirmed_person)
    }).catch(() => {})
  }, [event._id, event.date, needsDriver])

  const handleParentAssign = (person) => {
    if (!event._id) return
    setSaving(true); setCancelled(false)
    set(ref(db, `logistics/confirmations/${event.date}/${event._id}`), {
      event_summary: event.summary, logistics_type: event.logistics_type,
      confirmed: true, confirmed_person: person, cancelled: false,
      updated_at: new Date().toISOString(),
    }).then(() => { setParentPick(person); setSaving(false) }).catch(() => setSaving(false))
  }

  const handleCancel = () => {
    if (!event._id) return
    setSaving(true)
    set(ref(db, `logistics/confirmations/${event.date}/${event._id}`), {
      event_summary: event.summary, logistics_type: event.logistics_type,
      confirmed: false, confirmed_person: null, cancelled: true,
      cancel_reason: cancelReason, updated_at: new Date().toISOString(),
    }).then(() => { setCancelled(true); setSaving(false) }).catch(() => setSaving(false))
  }

  const CATEGORY_LABELS = {
    louise: 'Louise', kenna: 'Kenna', 'both-kids': 'Both Kids',
    trip: 'Trip', camp: 'Camp', school: 'School', family: 'Family',
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: colors.card, borderRadius: '16px 16px 0 0', padding: '20px 16px 28px',
        maxWidth: 500, width: '100%', border: `1px solid ${colors.cardBorder}`,
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.divider, margin: '0 auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 10, background: catBg, color: catColor, fontWeight: 600 }}>
            <CategoryIcon category={event.category} size={12} />{' '}
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
          {event.confidence !== 'high' && (
            <span style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
              <AlertTriangle size={10} /> review
            </span>
          )}
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 700, color: colors.text, margin: '4px 0 10px' }}>{event.summary}</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: colors.textDim, fontSize: 13 }}>
          <Clock size={14} />
          <span>
            {fmtDate(new Date(event.date + 'T12:00:00'))}
            {event.time_str && ` at ${event.time_str}`}
            {event.all_day && ' (all day)'}
          </span>
        </div>

        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: colors.textDim, fontSize: 13 }}>
            <MapPin size={14} /><span>{event.location.split('\n')[0]}</span>
          </div>
        )}

        <div style={{
          margin: '10px 0', padding: '10px 14px', borderRadius: 8,
          background: 'rgba(255,255,255,0.03)', fontSize: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <LogisticsIcon type={event.logistics_type} size={18} />
          <div>
            <div style={{ color: colors.text, fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              {getLogisticsLabel(event.logistics_type)}
            </div>
            <div style={{ color: colors.textDim, fontSize: 11 }}>
              {event.parent_stays ? 'Parent stays for this activity' : 'Drop off and pick up — parent does NOT stay'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: colors.textDim, marginBottom: 4 }}>
          <User size={14} />
          {event.who?.length > 0 ? event.who.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' + ') : 'Family'}
        </div>

        {needsDriver && (
          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {cancelled ? (
              <div>
                <div style={{ fontSize: 11, color: '#f87171', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={12} /> Cancelled / didn't go
                  {cancelReason && <span style={{ color: colors.textDim }}> — {cancelReason}</span>}
                </div>
                <button onClick={() => { setCancelled(false); setCancelReason('') }} style={{
                  marginTop: 4, padding: '4px 8px', borderRadius: 6,
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  color: colors.textDim, fontSize: 10, cursor: 'pointer',
                }}>Undo — reassign driver</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: colors.textDim, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} />{event.logistics_type === 'transport' ? "Who's driving?" : "Who's attending?"}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['michael', 'meghan', 'both'].map(person => (
                    <button key={person} onClick={() => handleParentAssign(person)} disabled={saving} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                      fontSize: 12, fontWeight: parentPick === person ? 600 : 400, cursor: 'pointer',
                      background: parentPick === person ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.04)',
                      color: parentPick === person ? '#60a5fa' : colors.textDim,
                    }}>{person === 'michael' ? 'Michael' : person === 'meghan' ? 'Meghan' : 'Both'}</button>
                  ))}
                </div>
                {parentPick && (
                  <button onClick={() => handleParentAssign(null)} disabled={saving} style={{
                    marginTop: 4, width: '100%', padding: '4px 0', borderRadius: 6,
                    background: 'none', border: 'none', color: colors.textDark, fontSize: 10, cursor: 'pointer',
                  }}>Clear</button>
                )}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <button onClick={() => setCancelled(true)} style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: 10, cursor: 'pointer',
                  }}>Didn't go / cancelled</button>
                </div>
              </>
            )}
          </div>
        )}

        {cancelled && needsDriver && (
          <div style={{
            marginTop: 6, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)',
          }}>
            <input type="text" placeholder="Optional: reason (e.g. cancelled, sick, etc.)"
              value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              onBlur={handleCancel} onKeyDown={e => { if (e.key === 'Enter') handleCancel() }}
              style={{ width: '100%', background: 'none', border: 'none', color: colors.text, fontSize: 11, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
        )}

        {event.note && (
          <div style={{
            marginTop: 10, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)',
            fontSize: 11, color: colors.textDim,
          }}>{event.note}</div>
        )}

        <button onClick={onClose} style={{
          marginTop: 14, width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.06)',
          border: 'none', borderRadius: 10, color: colors.textDim, fontSize: 13, cursor: 'pointer', fontWeight: 500,
        }}>Close</button>
      </div>
    </div>
  )
}

// ── Agenda View ────────────────────────────────────────────────────────────────

function AgendaView({ events, milestones, onEventClick }) {
  const today = todayStr()

  // Merge events + milestones, sorted by date then time
  const allItems = [
    ...events.map(e => ({ ...e, _isMilestone: false })),
    ...milestones.map(m => ({ ...m, _isMilestone: true })),
  ].filter(e => e.date >= today)
   .sort((a, b) => {
     if (a.date !== b.date) return a.date.localeCompare(b.date)
     if (a._isMilestone && !b._isMilestone) return 1
     if (!a._isMilestone && b._isMilestone) return -1
     return (a.time_str || '').localeCompare(b.time_str || '')
   })

  // Group by date
  const dateOrder = []
  const grouped = {}
  for (const ev of allItems) {
    if (!grouped[ev.date]) { grouped[ev.date] = []; dateOrder.push(ev.date) }
    grouped[ev.date].push(ev)
  }

  if (dateOrder.length === 0) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No upcoming events.</div>
  }

  return (
    <div>
      {dateOrder.map(dateStr => {
        const d = new Date(dateStr + 'T12:00:00')
        const isToday = dateStr === today
        const dayItems = grouped[dateStr]

        return (
          <div key={dateStr} style={{ marginBottom: 4 }}>
            {/* Date header */}
            <div style={{
              padding: '10px 0 5px',
              borderBottom: `1px solid ${isToday ? 'rgba(244,114,182,0.35)' : colors.divider}`,
              marginBottom: 4,
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? '#f472b6' : colors.text }}>
                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              {isToday && <span style={{ fontSize: 10, fontWeight: 700, color: '#f472b6', letterSpacing: '0.06em' }}>TODAY</span>}
            </div>

            {/* Items */}
            {dayItems.map((ev, i) =>
              ev._isMilestone ? (
                <BirthdayCard key={i} event={ev} />
              ) : (
                <div key={i} onClick={() => onEventClick(ev)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <CategoryIcon category={ev.category} size={16} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: colors.text, fontWeight: 500, fontSize: 13 }}>
                      {ev.summary}
                      {ev.confidence !== 'high' && (
                        <span style={{ color: '#fbbf24', marginLeft: 4 }}>
                          <AlertTriangle size={10} style={{ verticalAlign: -1 }} />
                        </span>
                      )}
                    </div>
                    {(ev.time_str || ev.location) && (
                      <div style={{ color: colors.textDim, fontSize: 11, marginTop: 1 }}>
                        {ev.time_str && <span>{ev.time_str}</span>}
                        {ev.time_str && ev.location && <span> · </span>}
                        {ev.location && <span>{ev.location.split('\n')[0].split(',')[0]}</span>}
                      </div>
                    )}
                  </div>
                  <LogisticsIcon type={ev.logistics_type} size={15} />
                </div>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SummerCalendar() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [view, setView] = useState('agenda')

  useEffect(() => {
    const unsub = onValue(ref(db, 'kids-summer/2026'), snap => {
      setData(snap.val() || {}); setLoading(false)
    }, err => { console.error(err); setLoading(false) })
    return () => unsub()
  }, [])

  const events = useMemo(() => {
    if (!data?.events) return []
    return Object.entries(data.events).map(([key, ev]) => ({ ...ev, _id: key }))
  }, [data])

  const filteredEvents = useMemo(() => {
    let evs = events.filter(e => e.category !== 'milestone' && e.category !== 'family')
    if (filter === 'louise') evs = evs.filter(e => e.who?.includes('louise'))
    else if (filter === 'kenna') evs = evs.filter(e => e.who?.includes('kenna'))
    else if (filter !== 'all') evs = evs.filter(e => e.category === filter)
    return evs
  }, [events, filter])

  const eventsByDate = useMemo(() => {
    const map = {}
    filteredEvents.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e) })
    return map
  }, [filteredEvents])

  // Milestones: all birthdays/anniversaries and family events, chronological
  const milestones = useMemo(() => {
    if (!data?.events) return []
    return Object.values(data.events)
      .filter(e => e.category === 'milestone' || e.category === 'family')
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'louise', label: 'LF', color: '#f472b6' },
    { key: 'kenna', label: 'KH', color: '#fbbf24' },
    { key: 'trip', label: 'Trips' },
    { key: 'camp', label: 'Camps' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: colors.textDim, fontSize: 13 }}>Loading...</div>
    </div>
  )

  const totalEvents = events.filter(e => e.category !== 'milestone' && e.category !== 'family').length

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, fontFamily: "'DM Sans', sans-serif",
      color: colors.text, padding: '16px 18px 48px', maxWidth: 900, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, margin: '0 0 2px' }}>
          Family Calendar
        </h1>
        <p style={{ color: colors.textDim, fontSize: 12, margin: 0 }}>
          {totalEvents} events · Summer 2026
          {data?.meta?.generated_at && (
            <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 8 }}>
              Updated {new Date(data.meta.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </p>
      </div>

      <KennaStrip schedule={data?.kenna_schedule} />
      <TripCards trips={data?.trips} />

      {/* Filter + view toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14,
        paddingBottom: 10, borderBottom: `1px solid ${colors.divider}`, flexWrap: 'wrap',
      }}>
        {FILTERS.map(f => {
          const active = filter === f.key
          const fgColor = f.color || getCategoryColor(f.key)
          const bgColor = f.color ? f.color + '18' : getCategoryBg(f.key)
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '5px 13px', borderRadius: 16, fontSize: 11, cursor: 'pointer',
              fontWeight: active ? 700 : 400,
              background: active ? bgColor : 'transparent',
              color: active ? fgColor : colors.textDim,
              border: active ? 'none' : `1px solid ${colors.cardBorder}`,
            }}>
              {f.label}
            </button>
          )
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
          {['agenda', 'grid'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 12px', borderRadius: 16, border: 'none', fontSize: 11, cursor: 'pointer',
              fontWeight: view === v ? 600 : 400,
              background: view === v ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: view === v ? colors.text : colors.textDim,
            }}>
              {v === 'agenda' ? 'Agenda' : 'Grid'}
            </button>
          ))}
        </div>
      </div>

      {/* Gaps warning */}
      {view === 'agenda' && data?.gaps && data.gaps.length > 0 && (
        <div style={{
          marginBottom: 14, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', fontSize: 11,
        }}>
          <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} /> {data.gaps.length} weeks with nothing scheduled
          </div>
          {data.gaps.slice(0, 3).map((g, i) => (
            <div key={i} style={{ color: colors.textDim, fontSize: 10, marginBottom: 2 }}>· {g.label}: {g.note}</div>
          ))}
        </div>
      )}

      {/* Agenda */}
      {view === 'agenda' && (
        <AgendaView
          events={filteredEvents}
          milestones={filter === 'all' ? milestones : []}
          onEventClick={setSelectedEvent}
        />
      )}

      {/* Grid */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {[4, 5, 6, 7].map(m => (
            <MonthGrid key={m} year={2026} month={m}
              eventsByDate={eventsByDate} onDayClick={setSelectedDay}
              kennaSchedule={data?.kenna_schedule} trips={data?.trips}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: 24, padding: '10px 14px', borderRadius: 8,
        background: colors.card, border: `1px solid ${colors.cardBorder}`,
        fontSize: 10, color: colors.textDim, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        <LogisticsIcon type="transport" size={12} /> <span>Drive</span>
        <LogisticsIcon type="attendance" size={12} /> <span>Stay</span>
        <LogisticsIcon type="travel" size={12} /> <span>Travel</span>
        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
          <AlertTriangle size={10} /> Needs review
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <StateIcon state="KY" size={12} color="#60a5fa" /> KY week
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          🎂 Birthday
        </span>
      </div>

      {/* Day Drawer */}
      {selectedDay && (
        <DayDrawer
          date={selectedDay}
          eventsByDate={eventsByDate}
          onClose={() => setSelectedDay(null)}
          onEventClick={ev => setSelectedEvent(ev)}
        />
      )}

      {/* Event Modal */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}
