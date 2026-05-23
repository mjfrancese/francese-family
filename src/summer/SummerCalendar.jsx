import { useState, useEffect, useMemo } from 'react'
import { ref, onValue, set, get } from 'firebase/database'
import { db } from '../firebase'
import { colors } from '../theme'
import {
  CategoryIcon, LogisticsIcon, getCategoryColor, getCategoryBg,
  getLogisticsLabel, MapPin, Clock, AlertTriangle, User, ChevronRight,
  Calendar, Car, Eye, Plane, Flag,
} from '../components/CategoryIcon'
import { StateIcon, DestinationIcon, LandmarkIcon } from '../components/icons'

// ── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Kenna Location Strip ─────────────────────────────────────────────────────

function KennaStrip({ schedule, trips }) {
  if (!schedule || schedule.length === 0) return null

  const today = todayStr()

  // Build transition markers from schedule
  // Each pair of consecutive blocks creates: "[location] until [date]" + "→ [new location]"
  const transitions = []
  for (let i = 0; i < schedule.length; i++) {
    const s = schedule[i]
    const next = schedule[i + 1]
    if (next && s.location !== next.location) {
      transitions.push({
        type: 'move',
        from: s.location,
        to: next.location,
        date: next.start,
        label: `${next.start === s.end ? 'same day' : ''}`,
      })
    }
  }

  // Build current location info
  let currentLoc = 'unknown'
  for (const s of schedule) {
    if (s.start <= today && s.end > today) { currentLoc = s.location; break }
  }

  // Find next transition
  const upcomingTransitions = transitions.filter(t => t.date >= today).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Current location */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        padding: '8px 12px', borderRadius: 10,
        background: currentLoc === 'St. Louis' ? 'rgba(52,211,153,0.08)' : 'rgba(96,165,250,0.08)',
        border: `1px solid ${currentLoc === 'St. Louis' ? 'rgba(52,211,153,0.18)' : 'rgba(96,165,250,0.18)'}`,
      }}>
        {currentLoc === 'St. Louis' ? (
          <StateIcon state="MO" size={22} color="#34d399" />
        ) : (
          <StateIcon state="KY" size={22} color="#60a5fa" />
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
            Kenna is in {currentLoc === 'St. Louis' ? 'St. Louis' : 'Kentucky'}
          </div>
          {upcomingTransitions.length > 0 && (
            <div style={{ fontSize: 11, color: colors.textDim, marginTop: 1 }}>
              Next:{' '}
              {upcomingTransitions[0].to === 'St. Louis' ? 'returns' : 'leaves for Kentucky'}{' '}
              {new Date(upcomingTransitions[0].date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transition timeline — compact scrolling list */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, fontSize: 10 }}>
        {schedule.filter(s => s.end > todayStr()).slice(0, 6).map((s, i) => {
          const isSTL = s.location === 'St. Louis'
          const startDate = new Date(s.start + 'T12:00:00')
          const endDate = new Date(s.end + 'T12:00:00')
          return (
            <div key={i} style={{
              flex: '0 0 auto', padding: '5px 10px', borderRadius: 16,
              background: isSTL ? 'rgba(52,211,153,0.06)' : 'rgba(96,165,250,0.06)',
              border: `1px solid ${isSTL ? 'rgba(52,211,153,0.15)' : 'rgba(96,165,250,0.15)'}`,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {isSTL ? (
                <StateIcon state="MO" size={12} color="#34d399" />
              ) : (
                <StateIcon state="KY" size={12} color="#60a5fa" />
              )}
              <span style={{ color: colors.textDim }}>
                {isSTL ? 'STL' : 'KY'}
                {' · '}
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {'–'}
                {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Trip Cards ───────────────────────────────────────────────────────────────

function TripCards({ trips }) {
  if (!trips || trips.length === 0) return null

  // Map trip slugs to icons
  const tripIconMap = {
    'london-paris': { type: 'landmark', landmark: 'eiffel' },
    'new-hampshire-july': { type: 'state', state: 'NH' },
    'st-augustine': { type: 'state', state: 'FL' },
  }

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
      {trips.map((t, i) => {
        const iconConf = tripIconMap[t.slug]
        return (
        <div key={i} style={{
          flex: '0 0 auto', minWidth: 170, padding: '10px 14px',
          borderRadius: 10, fontSize: 11,
          background: 'rgba(45,212,191,0.06)',
          border: '1px solid rgba(45,212,191,0.12)',
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
            {new Date(t.start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {new Date(t.end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        )
      })}
    </div>
  )
}

// ── Month Grid ────────────────────────────────────────────────────────────────

function MonthGrid({ year, month, eventsByDate, onEventClick, kennaSchedule, trips }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const today = todayStr()
  const HIDE_BEFORE = new Date(2026, 4, 23)

  const tripDates = new Set()
  for (const t of trips || []) {
    let d = new Date(t.start + 'T12:00:00')
    const end = new Date(t.end + 'T12:00:00')
    while (d <= end) { tripDates.add(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  }

  const rows = []
  let cells = []
  for (let cell = 0; cell < totalCells; cell++) {
    if (cell % 7 === 0 && cells.length > 0) {
      rows.push(<tr key={rows.length}>{cells}</tr>); cells = []
    }
    const dayNum = cell - firstDay + 1
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth
    const dateObj = new Date(year, month, dayNum)
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    const isToday = dateStr === today
    const isBefore = dateObj < HIDE_BEFORE
    const dayEvents = eventsByDate[dateStr] || []
    const isTrip = tripDates.has(dateStr)

    let kennaLoc = null
    for (const s of kennaSchedule || []) {
      if (s.start <= dateStr && s.end > dateStr) { kennaLoc = s.location; break }
    }

    cells.push(
      <td key={cell} style={{
        verticalAlign: 'top', padding: '2px 3px', height: 44, textAlign: 'center',
        borderRadius: 4, position: 'relative',
        opacity: (!inMonth || isBefore) ? 0.2 : 1,
        background: isTrip ? 'rgba(45,212,191,0.06)' : 'transparent',
        border: isToday ? '1.5px solid rgba(244,114,182,0.4)' : '1px solid transparent',
      }}>
        {inMonth && !isBefore && (
          <>
            <div style={{
              fontSize: 10, fontWeight: isToday ? 700 : 400,
              color: isToday ? '#f472b6' : isTrip ? '#2dd4bf' : colors.textDim,
              marginBottom: 1, lineHeight: 1.2,
            }}>
              {dayNum}
            </div>
            {dayEvents.slice(0, 2).map((ev, i) => (
              <div key={i}
                onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: getCategoryColor(ev.category),
                  display: 'inline-block', margin: '0 1px', cursor: 'pointer',
                }}
                title={ev.summary}
              />
            ))}
            {dayEvents.length > 2 && (
              <span style={{ fontSize: 8, color: colors.textDim }}>+{dayEvents.length - 2}</span>
            )}
            {kennaLoc === 'Kentucky' && (
              <div style={{ width: '100%', height: 2, background: 'rgba(96,165,250,0.25)', borderRadius: 1, marginTop: 1 }} />
            )}
          </>
        )}
      </td>
    )
  }
  while (cells.length < 7) cells.push(<td key={`pad-${cells.length}`} style={{ opacity: 0.2 }} />)
  rows.push(<tr key={rows.length}>{cells}</tr>)

  return (
    <div style={{
      background: colors.card, borderRadius: 10, padding: '10px 10px',
      border: `1px solid ${colors.cardBorder}`,
    }}>
      <div style={{
        textAlign: 'center', fontSize: 13, fontWeight: 600,
        color: colors.text, marginBottom: 6,
      }}>
        {new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' })}
      </div>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {DAYS.map(d => (
              <th key={d} style={{
                fontSize: 8, fontWeight: 600, color: colors.textDim,
                textTransform: 'uppercase', paddingBottom: 4, letterSpacing: 0.5,
              }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

// ── Event Detail Modal ────────────────────────────────────────────────────────

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
    setSaving(true)
    setCancelled(false)
    set(ref(db, `logistics/confirmations/${event.date}/${event._id}`), {
      event_summary: event.summary,
      logistics_type: event.logistics_type,
      confirmed: true,
      confirmed_person: person,
      cancelled: false,
      updated_at: new Date().toISOString(),
    }).then(() => { setParentPick(person); setSaving(false) })
      .catch(() => setSaving(false))
  }

  const handleCancel = () => {
    if (!event._id) return
    setSaving(true)
    set(ref(db, `logistics/confirmations/${event.date}/${event._id}`), {
      event_summary: event.summary,
      logistics_type: event.logistics_type,
      confirmed: false,
      confirmed_person: null,
      cancelled: true,
      cancel_reason: cancelReason,
      updated_at: new Date().toISOString(),
    }).then(() => { setCancelled(true); setSaving(false) })
      .catch(() => setSaving(false))
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: colors.card, borderRadius: '16px 16px 0 0', padding: '20px 16px 28px',
        maxWidth: 500, width: '100%', border: `1px solid ${colors.cardBorder}`,
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.divider, margin: '0 auto 14px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 10, background: catBg, color: catColor, fontWeight: 600 }}>
            <CategoryIcon category={event.category} size={12} />{' '}
            {event.category === 'louise' ? 'Louise' :
             event.category === 'kenna' ? 'Kenna' :
             event.category === 'both-kids' ? 'Both Kids' :
             event.category === 'trip' ? 'Trip' :
             event.category === 'camp' ? 'Camp' :
             event.category === 'school' ? 'School' :
             event.category === 'family' ? 'Family' : event.category}
          </span>
          {event.confidence !== 'high' && (
            <span style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
              <AlertTriangle size={10} /> review
            </span>
          )}
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 700, color: colors.text, margin: '4px 0 10px' }}>
          {event.summary}
        </h2>

        {/* Date/Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: colors.textDim, fontSize: 13 }}>
          <Clock size={14} />
          <span>
            {fmtDate(new Date(event.date + 'T12:00:00'))}
            {event.time_str && ` at ${event.time_str}`}
            {event.all_day && ' (all day)'}
          </span>
        </div>

        {/* Location */}
        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: colors.textDim, fontSize: 13 }}>
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        )}

        {/* Logistics */}
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

        {/* Who */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: colors.textDim, marginBottom: 4 }}>
          <User size={14} />
          {event.who?.length > 0
            ? event.who.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' + ')
            : 'Family'}
        </div>

        {/* Parent assignment */}
        {needsDriver && (
          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {cancelled ? (
              <div>
                <div style={{ fontSize: 11, color: '#f87171', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={12} /> Cancelled / didn't go
                  {cancelReason && <span style={{ color: colors.textDim }}>— {cancelReason}</span>}
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
                  <User size={12} />
                  {event.logistics_type === 'transport' ? "Who's driving?" : "Who's attending?"}
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
                {/* Cancel / didn't go */}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <button onClick={() => setCancelled(true)} style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    background: 'rgba(248,113,113,0.08)', color: '#f87171',
                    fontSize: 10, cursor: 'pointer',
                  }}>Didn't go / cancelled</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Cancel reason input */}
        {cancelled && needsDriver && (
          <div style={{
            marginTop: 6, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)',
          }}>
            <input
              type="text"
              placeholder="Optional: reason (e.g. cancelled, sick, etc.)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              onBlur={handleCancel}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCancel() }}
              style={{
                width: '100%', background: 'none', border: 'none',
                color: colors.text, fontSize: 11, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}

        {/* Note */}
        {event.note && (
          <div style={{
            marginTop: 10, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)',
            fontSize: 11, color: colors.textDim,
          }}>
            {event.note}
          </div>
        )}

        <button onClick={onClose} style={{
          marginTop: 14, width: '100%', padding: '10px 0',
          background: 'rgba(255,255,255,0.06)', border: 'none',
          borderRadius: 10, color: colors.textDim, fontSize: 13, cursor: 'pointer', fontWeight: 500,
        }}>Close</button>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SummerCalendar() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showListView, setShowListView] = useState(true)

  useEffect(() => {
    const unsub = onValue(ref(db, 'kids-summer/2026'), (snap) => {
      setData(snap.val() || {}); setLoading(false)
    }, (err) => { console.error(err); setLoading(false) })
    return () => unsub()
  }, [])

  const events = useMemo(() => {
    if (!data?.events) return []
    return Object.entries(data.events).map(([key, ev]) => ({ ...ev, _id: key }))
  }, [data])

  const filteredEvents = useMemo(() => {
    let evs = events
    if (filter === 'all') evs = events.filter(e => e.category !== 'milestone')
    else if (filter === 'louise') evs = events.filter(e => e.who?.includes('louise'))
    else if (filter === 'kenna') evs = events.filter(e => e.who?.includes('kenna'))
    else evs = events.filter(e => e.category === filter)
    return evs
  }, [events, filter])

  const eventsByDate = useMemo(() => {
    const map = {}
    filteredEvents.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e) })
    return map
  }, [filteredEvents])

  const upcomingEvents = useMemo(() => {
    const t = todayStr()
    return filteredEvents.filter(e => e.date >= t).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.time_str || '').localeCompare(b.time_str || '')
    })
  }, [filteredEvents])

  const milestones = useMemo(() => {
    if (!data?.events) return []
    return Object.values(data.events)
      .filter(e => e.category === 'milestone')
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'louise', label: 'Louise' },
    { key: 'kenna', label: 'Kenna' },
    { key: 'trip', label: 'Trips' },
    { key: 'camp', label: 'Camps' },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.textDim, fontSize: 13 }}>Loading...</div>
      </div>
    )
  }

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
          {events.length} events · May 23 – Aug 31
          {data?.meta?.generated_at && (
            <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 8 }}>
              Updated {new Date(data.meta.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </p>
      </div>

      {/* Kenna Location Strip */}
      <KennaStrip schedule={data?.kenna_schedule} trips={data?.trips} />

      {/* Trip Cards */}
      <TripCards trips={data?.trips} />

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14,
        paddingBottom: 10, borderBottom: `1px solid ${colors.divider}`,
      }}>
        {FILTERS.map(f => {
          const active = filter === f.key
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: 16, border: 'none', fontSize: 11,
              fontWeight: active ? 600 : 400, cursor: 'pointer',
              background: active ? getCategoryBg(f.key) : 'transparent',
              color: active ? getCategoryColor(f.key) : colors.textDim,
            }}>
              {f.label}
            </button>
          )
        })}
        <button onClick={() => setShowListView(!showListView)} style={{
          padding: '6px 14px', borderRadius: 16, border: 'none', fontSize: 11,
          cursor: 'pointer', marginLeft: 'auto',
          background: 'transparent', color: colors.textDim,
        }}>
          {showListView ? 'Grid' : 'List'}
        </button>
      </div>

      {/* Grid View */}
      {!showListView && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {[4, 5, 6, 7].map(m => (
            <MonthGrid key={m} year={2026} month={m}
              eventsByDate={eventsByDate} onEventClick={setSelectedEvent}
              kennaSchedule={data?.kenna_schedule} trips={data?.trips}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {showListView && (
        <div>
          {/* Gap warnings */}
          {data?.gaps && data.gaps.length > 0 && (
            <div style={{
              marginBottom: 14, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)',
              fontSize: 11,
            }}>
              <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={13} /> {data.gaps.length} weeks with nothing scheduled
              </div>
              {data.gaps.slice(0, 3).map((g, i) => (
                <div key={i} style={{ color: colors.textDim, fontSize: 10, marginBottom: 2 }}>· {g.label}: {g.note}</div>
              ))}
            </div>
          )}

          {/* Event list */}
          <div style={{ fontSize: 12 }}>
            {upcomingEvents.length === 0 && (
              <div style={{ color: colors.textDim, textAlign: 'center', padding: 30 }}>No upcoming events.</div>
            )}
            {upcomingEvents.map((ev, i) => {
              const d = new Date(ev.date + 'T12:00:00')
              const isToday = ev.date === todayStr()

              return (
                <div key={i} onClick={() => setSelectedEvent(ev)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 8, cursor: 'pointer',
                  border: isToday ? '1px solid rgba(244,114,182,0.25)' : '1px solid transparent',
                  background: isToday ? 'rgba(244,114,182,0.04)' : 'transparent',
                  marginBottom: 2,
                }}>
                  {/* Date */}
                  <div style={{ minWidth: 52, textAlign: 'center', color: isToday ? getCategoryColor(ev.category) : colors.textDim, fontSize: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{MONTHS[d.getMonth()]} {d.getDate()}</div>
                    <div style={{ opacity: 0.6 }}>{DAYS[d.getDay()]}</div>
                  </div>

                  {/* Category icon */}
                  <CategoryIcon category={ev.category} size={16} />

                  {/* Event info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: colors.text, fontWeight: 500, fontSize: 12 }}>
                      {ev.summary}
                      {ev.confidence !== 'high' && (
                        <span style={{ color: '#fbbf24', marginLeft: 4 }}>
                          <AlertTriangle size={10} style={{ verticalAlign: -1 }} />
                        </span>
                      )}
                    </div>
                    <div style={{ color: colors.textDim, fontSize: 10, marginTop: 1 }}>
                      {ev.time_str && <span>{ev.time_str} · </span>}
                      {ev.location && <span>{ev.location}</span>}
                    </div>
                  </div>

                  {/* Logistics icon */}
                  <LogisticsIcon type={ev.logistics_type} size={16} />
                </div>
              )
            })}
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 10, fontWeight: 600, color: colors.textDim,
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CategoryIcon category="milestone" size={13} /> Birthdays & Anniversaries
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {milestones.map((m, i) => {
                  const d = new Date(m.date + 'T12:00:00')
                  return (
                    <div key={i} style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 10,
                      background: 'rgba(156,163,175,0.06)', border: '1px solid rgba(156,163,175,0.1)',
                      color: colors.textDim,
                    }}>
                      {MONTHS[d.getMonth()]} {d.getDate()} — {m.summary}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
      </div>

      {/* Event modal */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}
