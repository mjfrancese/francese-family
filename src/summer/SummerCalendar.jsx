import { useState, useEffect, useMemo } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { colors } from '../theme'
import { MapPin, Clock, AlertCircle, X, Filter } from 'lucide-react'

// ── Category config ──────────────────────────────────────────────────────────

const CATS = {
  louise:   { label: 'Louise',  color: '#f472b6', bg: 'rgba(244,114,182,0.15)', emoji: '🎀' },
  kenna:    { label: 'Kenna',   color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', emoji: '📣' },
  'both-kids': { label: 'Both', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', emoji: '👧👧' },
  family:   { label: 'Family',  color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', emoji: '👨‍👩‍👧‍👧' },
  trip:     { label: 'Trip',    color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)', emoji: '✈️' },
  camp:     { label: 'Camp',    color: '#34d399', bg: 'rgba(52,211,153,0.15)', emoji: '⛺' },
  school:   { label: 'School',  color: '#fb923c', bg: 'rgba(251,146,60,0.15)', emoji: '🍎' },
  milestone: { label: 'Birthdays', color: '#9ca3af', bg: 'rgba(156,163,175,0.10)', emoji: '🎂' },
}

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

function KennaStrip({ schedule, trips, events }) {
  if (!schedule || schedule.length === 0) return null

  const today = todayStr()
  const weeks = []
  const start = new Date('2026-05-23')
  const end = new Date('2026-08-31')

  // Build week blocks
  let d = new Date(start)
  while (d <= end) {
    const weekEnd = new Date(d)
    weekEnd.setDate(weekEnd.getDate() + 6)
    if (weekEnd > end) weekEnd.setTime(end.getTime())

    const dStr = d.toISOString().slice(0, 10)
    const weStr = weekEnd.toISOString().slice(0, 10)

    // Find Kenna's location for this week
    let loc = 'unknown'
    for (const s of schedule) {
      if (s.start <= weStr && s.end > dStr) {
        loc = s.location
        break
      }
    }

    // Check if this week has a trip
    let tripLabel = null
    for (const t of trips || []) {
      if (t.start <= weStr && t.end >= dStr) {
        tripLabel = t.label
        break
      }
    }

    // Count events this week
    const weekEventCount = (events || []).filter(e => e.date >= dStr && e.date <= weStr).length

    weeks.push({
      start: dStr, end: weStr,
      label: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      location: loc,
      tripLabel,
      weekEventCount,
      isCurrent: today >= dStr && today <= weStr,
    })

    d.setDate(d.getDate() + 7)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8,
        WebkitOverflowScrolling: 'touch',
      }}>
        {weeks.map((w, i) => {
          const isSTL = w.location === 'St. Louis'
          const isKY = w.location === 'Kentucky'
          return (
            <div key={i} style={{
              flex: '0 0 auto', minWidth: 64, padding: '6px 8px',
              borderRadius: 8, textAlign: 'center', fontSize: 10,
              background: w.tripLabel ? 'rgba(45,212,191,0.18)'
                       : isSTL ? 'rgba(52,211,153,0.12)'
                       : isKY ? 'rgba(96,165,250,0.10)'
                       : 'rgba(255,255,255,0.03)',
              border: w.isCurrent ? '1.5px solid rgba(244,114,182,0.4)'
                    : '1px solid transparent',
              color: w.tripLabel ? '#2dd4bf'
                   : isSTL ? '#34d399'
                   : isKY ? '#60a5fa'
                   : colors.textDim,
            }}>
              <div style={{ fontWeight: 600, fontSize: 9, opacity: 0.7 }}>{w.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, margin: '2px 0' }}>
                {w.tripLabel ? '✈️' : isSTL ? '🏠' : '🏡'}
              </div>
              <div style={{ fontSize: 9 }}>
                {w.tripLabel ? 'TRIP' : isSTL ? 'STL' : 'KY'}
              </div>
              {w.weekEventCount > 0 && (
                <div style={{ fontSize: 8, marginTop: 2, opacity: 0.8 }}>
                  {w.weekEventCount} event{w.weekEventCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 9, color: colors.textDim, justifyContent: 'center' }}>
        <span>🏠 STL</span><span>🏡 Kentucky</span><span>✈️ Trip</span>
      </div>
    </div>
  )
}

// ── Trip Cards ────────────────────────────────────────────────────────────────

function TripCards({ trips }) {
  if (!trips || trips.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
      {trips.map((t, i) => (
        <div key={i} style={{
          flex: '0 0 auto', minWidth: 150, padding: '8px 12px',
          borderRadius: 10, fontSize: 11,
          background: 'rgba(45,212,191,0.10)',
          border: '1px solid rgba(45,212,191,0.2)',
        }}>
          <div style={{ color: '#2dd4bf', fontWeight: 700, fontSize: 12 }}>{t.label}</div>
          <div style={{ color: colors.textDim, fontSize: 10, marginTop: 2 }}>
            {new Date(t.start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {new Date(t.end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {t.note && <div style={{ color: colors.textDim, fontSize: 9, marginTop: 2, opacity: 0.7 }}>{t.note}</div>}
        </div>
      ))}
    </div>
  )
}

// ── Month Grid (compact, mobile-first) ────────────────────────────────────────

function MonthGrid({ year, month, eventsByDate, onEventClick, kennaSchedule, trips }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const today = todayStr()
  const HIDE_BEFORE = new Date(2026, 4, 23)

  // Build lookup: is this date in a trip?
  const tripDates = new Set()
  for (const t of trips || []) {
    let d = new Date(t.start + 'T12:00:00')
    const end = new Date(t.end + 'T12:00:00')
    while (d <= end) {
      tripDates.add(d.toISOString().slice(0, 10))
      d.setDate(d.getDate() + 1)
    }
  }

  const rows = []
  let cells = []
  for (let cell = 0; cell < totalCells; cell++) {
    if (cell % 7 === 0 && cells.length > 0) {
      rows.push(<tr key={rows.length}>{cells}</tr>)
      cells = []
    }
    const dayNum = cell - firstDay + 1
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth
    const dateObj = new Date(year, month, dayNum)
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    const isToday = dateStr === today
    const isBefore = dateObj < HIDE_BEFORE
    const dayEvents = eventsByDate[dateStr] || []
    const isTrip = tripDates.has(dateStr)

    // Kenna location
    let kennaLoc = null
    for (const s of kennaSchedule || []) {
      if (s.start <= dateStr && s.end > dateStr) {
        kennaLoc = s.location
        break
      }
    }

    cells.push(
      <td key={cell} style={{
        verticalAlign: 'top', padding: '1px 2px', height: 44, textAlign: 'center',
        borderRadius: 4, position: 'relative',
        opacity: (!inMonth || isBefore) ? 0.2 : 1,
        background: isTrip ? 'rgba(45,212,191,0.08)' : 'transparent',
        border: isToday ? '1.5px solid rgba(244,114,182,0.5)' : '1px solid transparent',
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
            {dayEvents.slice(0, 2).map((ev, i) => {
              const cat = CATS[ev.category] || CATS.family
              return (
                <div key={i}
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: cat.color, display: 'inline-block', margin: '0 1px',
                    cursor: 'pointer',
                  }}
                  title={ev.summary}
                />
              )
            })}
            {dayEvents.length > 2 && (
              <span style={{ fontSize: 8, color: colors.textDim }}>+{dayEvents.length - 2}</span>
            )}
            {/* Kenna in KY indicator */}
            {kennaLoc === 'Kentucky' && (
              <div style={{
                width: '100%', height: 2, background: 'rgba(96,165,250,0.3)',
                borderRadius: 1, marginTop: 1,
              }} />
            )}
          </>
        )}
      </td>
    )
  }
  while (cells.length < 7) cells.push(<td key={`pad-${cells.length}`} style={{ opacity: 0.2 }} />)
  rows.push(<tr key={rows.length}>{cells}</tr>)

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' })

  return (
    <div style={{
      background: colors.card, borderRadius: 10, padding: '8px 10px',
      border: `1px solid ${colors.cardBorder}`, marginBottom: 12,
    }}>
      <div style={{
        textAlign: 'center', fontSize: 13, fontWeight: 600,
        color: colors.text, marginBottom: 6,
      }}>
        {monthLabel}
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
  const cat = CATS[event.category] || CATS.family

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: colors.card, borderRadius: '16px 16px 0 0', padding: '20px 16px 28px',
        maxWidth: 500, width: '100%', border: `1px solid ${colors.cardBorder}`,
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.divider, margin: '0 auto 14px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 8, fontSize: 10,
            background: cat.bg, color: cat.color, fontWeight: 600,
          }}>
            {cat.emoji} {cat.label}
          </span>
          {event.confidence !== 'high' && (
            <span style={{ fontSize: 10, color: '#fbbf24' }} title="Needs review">⚠️ review</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: colors.textDim, fontSize: 13 }}>
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        )}

        {/* Logistics */}
        <div style={{
          margin: '10px 0', padding: '10px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,0.03)', fontSize: 12,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>
            {event.logistics_type === 'transport' ? '🚗' :
             event.logistics_type === 'attendance' ? '👀' :
             event.logistics_type === 'travel' ? '✈️' : '📌'}
          </span>
          <div>
            <div style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>
              {event.logistics_type === 'transport' ? 'Drop off / Pick up' :
               event.logistics_type === 'attendance' ? 'Parent stays' :
               event.logistics_type === 'travel' ? 'Family travel' : 'Heads up'}
            </div>
            <div style={{ color: colors.textDim, fontSize: 11 }}>
              {event.parent_stays ? 'Parent stays for this activity' : 'Drop off and pick up — parent does NOT stay'}
            </div>
          </div>
        </div>

        {/* Who */}
        <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 4 }}>
          👤 {event.who?.length > 0
            ? event.who.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' + ')
            : 'Family'}
          {event.kenna_location && event.kenna_location !== 'St. Louis' && (
            <span style={{ marginLeft: 8, color: '#60a5fa', fontSize: 10 }}>
              (Kenna in {event.kenna_location})
            </span>
          )}
        </div>

        {/* Note */}
        {event.note && (
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
            fontSize: 11, color: colors.textDim,
          }}>
            {event.note}
          </div>
        )}

        {/* Close button */}
        <button onClick={onClose} style={{
          marginTop: 14, width: '100%', padding: '10px 0',
          background: 'rgba(255,255,255,0.06)', border: 'none',
          borderRadius: 10, color: colors.textDim, fontSize: 13,
          cursor: 'pointer', fontWeight: 500,
        }}>
          Close
        </button>
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
    const ref2026 = ref(db, 'kids-summer/2026')
    const unsub = onValue(ref2026, (snap) => {
      setData(snap.val() || {})
      setLoading(false)
    }, (err) => {
      console.error('Firebase error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const events = useMemo(() => {
    if (!data?.events) return []
    return Object.values(data.events)
  }, [data])

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events
    if (filter === 'louise') return events.filter(e => e.who?.includes('louise'))
    if (filter === 'kenna') return events.filter(e => e.who?.includes('kenna'))
    return events.filter(e => e.category === filter)
  }, [events, filter])

  const eventsByDate = useMemo(() => {
    const map = {}
    filteredEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [filteredEvents])

  const upcomingEvents = useMemo(() => {
    const today = todayStr()
    return filteredEvents.filter(e => e.date >= today).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.time_str || '').localeCompare(b.time_str || '')
    })
  }, [filteredEvents])

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
      color: colors.text, padding: '12px 14px 40px', maxWidth: 600, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600,
          margin: '0 0 2px',
        }}>
          ☀️ Kids Summer
        </h1>
        <p style={{ color: colors.textDim, fontSize: 12, margin: 0 }}>
          {events.length} events · May 23 – Aug 31
          {data?.meta?.generated_at && (
            <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 8 }}>
              Updated {new Date(data.meta.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </p>
      </div>

      {/* Kenna Location Strip */}
      <KennaStrip schedule={data?.kenna_schedule} trips={data?.trips} events={events} />

      {/* Trip Cards */}
      <TripCards trips={data?.trips} />

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14,
        paddingBottom: 10, borderBottom: `1px solid ${colors.divider}`,
      }}>
        {FILTERS.map(f => {
          const cat = CATS[f.key]
          const active = filter === f.key
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: 16, border: 'none', fontSize: 12,
              fontWeight: active ? 600 : 400, cursor: 'pointer',
              background: active ? (cat?.bg || colors.cardHover) : 'transparent',
              color: active ? (cat?.color || colors.text) : colors.textDim,
            }}>
              {f.label}
            </button>
          )
        })}
        <button onClick={() => setShowListView(!showListView)} style={{
          padding: '6px 14px', borderRadius: 16, border: 'none', fontSize: 12,
          fontWeight: 400, cursor: 'pointer', marginLeft: 'auto',
          background: 'transparent', color: colors.textDim,
        }}>
          {showListView ? '📅 Grid' : '📋 List'}
        </button>
      </div>

      {/* Grid View */}
      {!showListView && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {[4, 5, 6, 7].map(m => (
            <MonthGrid key={m} year={2026} month={m}
              eventsByDate={eventsByDate}
              onEventClick={setSelectedEvent}
              kennaSchedule={data?.kenna_schedule}
              trips={data?.trips}
            />
          ))}
        </div>
      )}

      {/* List View (default for mobile) */}
      {showListView && (
        <div>
          {/* Issues section */}
          {data?.gaps && data.gaps.length > 0 && (
            <div style={{
              marginBottom: 14, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
              fontSize: 11,
            }}>
              <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 6, fontSize: 12 }}>
                ⚠️ {data.gaps.length} weeks with nothing scheduled
              </div>
              {data.gaps.slice(0, 3).map((g, i) => (
                <div key={i} style={{ color: colors.textDim, fontSize: 10, marginBottom: 2 }}>
                  · {g.label}: {g.note}
                </div>
              ))}
              {data.gaps.length > 3 && (
                <div style={{ color: colors.textDim, fontSize: 10, opacity: 0.5 }}>
                  +{data.gaps.length - 3} more
                </div>
              )}
            </div>
          )}

          {/* Event list */}
          <div style={{ fontSize: 12 }}>
            {upcomingEvents.length === 0 && (
              <div style={{ color: colors.textDim, textAlign: 'center', padding: 30 }}>
                No upcoming events with this filter.
              </div>
            )}
            {upcomingEvents.map((ev, i) => {
              const cat = CATS[ev.category] || CATS.family
              const d = new Date(ev.date + 'T12:00:00')
              const today = todayStr()
              const isToday = ev.date === today
              const isSoon = ev.date > today && ev.date <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

              return (
                <div key={i} onClick={() => setSelectedEvent(ev)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 8, cursor: 'pointer',
                  border: isToday ? '1px solid rgba(244,114,182,0.3)' : '1px solid transparent',
                  background: isToday ? 'rgba(244,114,182,0.06)' : 'transparent',
                  marginBottom: 2,
                }}>
                  {/* Date column */}
                  <div style={{
                    minWidth: 52, textAlign: 'center',
                    color: isToday ? cat.color : colors.textDim, fontSize: 10,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>
                      {MONTHS[d.getMonth()]} {d.getDate()}
                    </div>
                    <div style={{ opacity: 0.6 }}>{DAYS[d.getDay()]}</div>
                  </div>

                  {/* Category dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: cat.color,
                    flexShrink: 0,
                  }} />

                  {/* Event info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: colors.text, fontWeight: 500, fontSize: 12 }}>
                      {ev.summary}
                      {ev.confidence !== 'high' && (
                        <span style={{ color: '#fbbf24', fontSize: 10, marginLeft: 4 }}>⚠️</span>
                      )}
                    </div>
                    <div style={{ color: colors.textDim, fontSize: 10 }}>
                      {ev.time_str && <span>{ev.time_str} · </span>}
                      {cat.emoji} {cat.label}
                      {ev.location && <span> · {ev.location}</span>}
                      {ev.kenna_location === 'Kentucky' && (
                        <span style={{ color: '#60a5fa' }}> · Kenna in KY</span>
                      )}
                    </div>
                  </div>

                  {/* Logistics icon */}
                  <div style={{ fontSize: 14, flexShrink: 0 }}>
                    {ev.logistics_type === 'transport' ? '🚗' :
                     ev.logistics_type === 'attendance' ? '👀' :
                     ev.logistics_type === 'travel' ? '✈️' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Milestones (birthdays & anniversaries) */}
      {data?.events && (() => {
        const milestones = Object.values(data.events)
          .filter(e => e.category === 'milestone')
          .sort((a, b) => a.date.localeCompare(b.date))
        if (milestones.length === 0) return null
        return (
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: colors.textDim,
              textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
            }}>
              🎂 Birthdays & Anniversaries
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {milestones.map((m, i) => {
                const d = new Date(m.date + 'T12:00:00')
                return (
                  <div key={i} style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 10,
                    background: 'rgba(156,163,175,0.08)',
                    border: '1px solid rgba(156,163,175,0.12)',
                    color: colors.textDim,
                  }}>
                    {MONTHS[d.getMonth()]} {d.getDate()} — {m.summary}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Legend */}
      <div style={{
        marginTop: 20, padding: '10px 12px', borderRadius: 8,
        background: colors.card, border: `1px solid ${colors.cardBorder}`,
        fontSize: 10, color: colors.textDim, display: 'flex', flexWrap: 'wrap', gap: 10,
      }}>
        <span>🚗 Drive</span><span>👀 Stay</span><span>✈️ Travel</span>
        <span style={{ color: '#fbbf24' }}>⚠️ Needs review</span>
        <span style={{ color: '#60a5fa' }}>— KY stripe</span>
        <span style={{ color: '#2dd4bf' }}>— Trip week</span>
      </div>

      {/* Bottom sheet modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}
