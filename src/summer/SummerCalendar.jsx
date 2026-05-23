import { useState, useEffect, useMemo } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { colors } from '../theme'
import { ChevronLeft, ChevronRight, MapPin, Clock, User, Car, Eye, AlertCircle, X } from 'lucide-react'

// ── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = {
  louise:   { label: 'Louise',   color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  kenna:    { label: 'Kenna',    color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  'both-kids': { label: 'Both Kids', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  family:   { label: 'Family',   color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  trip:     { label: 'Trip',     color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)' },
  camp:     { label: 'Camp',     color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  school:   { label: 'School',   color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
}

const LOGISTICS_ICONS = {
  transport:  { icon: Car, label: 'Drop off / pick up — parent does NOT stay' },
  attendance: { icon: Eye, label: 'Parent stays for this activity' },
  travel:     { icon: MapPin, label: 'Travel — whole family' },
  info:       { icon: AlertCircle, label: 'FYI — no action needed' },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ── Components ───────────────────────────────────────────────────────────────

function EventChip({ event, onClick }) {
  const cat = CATEGORIES[event.category] || CATEGORIES.family
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(event) }}
      style={{
        fontSize: 10, lineHeight: 1.3,
        padding: '1px 4px', marginBottom: 1, borderRadius: 3,
        background: cat.bg, color: cat.color,
        cursor: 'pointer', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: 'flex', alignItems: 'center', gap: 2,
      }}
      title={event.summary + (event.location ? ' @ ' + event.location : '')}
    >
      {event.logistics_type === 'transport' && <Car size={8} />}
      {event.logistics_type === 'attendance' && <Eye size={8} />}
      {event.time_str && <span style={{opacity:0.7,marginRight:1}}>{event.time_str}</span>}
      <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis'}}>{event.summary}</span>
    </div>
  )
}

function MonthGrid({ year, month, eventsByDate, onEventClick }) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const today = todayStr()
  const monthStart = new Date(year, month, 1)

  // Days before May 23 are dimmed
  const HIDE_BEFORE = new Date(2026, 4, 23)

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

    cells.push(
      <td key={cell} style={{
        verticalAlign: 'top', padding: '2px 3px', height: 52,
        textAlign: 'center', borderRadius: 6,
        opacity: (!inMonth || isBefore) ? 0.25 : 1,
        background: isToday ? 'rgba(244,114,182,0.12)' : 'transparent',
        border: isToday ? '1px solid rgba(244,114,182,0.3)' : '1px solid transparent',
      }}>
        {inMonth && (
          <>
            <div style={{
              fontSize: 11, fontWeight: isToday ? 700 : 500,
              color: isToday ? '#f472b6' : colors.textDim,
              marginBottom: 2, lineHeight: 1,
            }}>
              {dayNum}
            </div>
            {dayEvents.slice(0, 3).map((ev, i) => (
              <EventChip key={i} event={ev} onClick={onEventClick} />
            ))}
            {dayEvents.length > 3 && (
              <div style={{fontSize:9,color:colors.textDim}}>+{dayEvents.length - 3} more</div>
            )}
          </>
        )}
      </td>
    )
  }

  // Pad final row
  while (cells.length < 7) {
    cells.push(<td key={`pad-${cells.length}`} style={{opacity:0.2}}></td>)
  }
  rows.push(<tr key={rows.length}>{cells}</tr>)

  return (
    <div style={{
      background: colors.card, borderRadius: 10, padding: '10px 8px',
      border: `1px solid ${colors.cardBorder}`,
    }}>
      <h3 style={{
        textAlign: 'center', fontSize: 13, fontWeight: 600,
        color: colors.text, marginBottom: 8,
      }}>
        {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {DAYS.map(d => (
              <th key={d} style={{
                fontSize: 9, fontWeight: 600, color: colors.textDim,
                textTransform: 'uppercase', paddingBottom: 6, letterSpacing: 0.5,
              }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

function EventModal({ event, onClose }) {
  if (!event) return null
  const cat = CATEGORIES[event.category] || CATEGORIES.family
  const log = LOGISTICS_ICONS[event.logistics_type] || LOGISTICS_ICONS.info
  const LogIcon = log.icon

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: colors.card, borderRadius: 12, padding: 20,
        maxWidth: 400, width: '100%', border: `1px solid ${colors.cardBorder}`,
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none', color: colors.textDim,
          cursor: 'pointer', padding: 4,
        }}>
          <X size={18} />
        </button>

        {/* Category badge */}
        <div style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 10,
          background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 600,
          marginBottom: 8,
        }}>
          {cat.label}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '4px 0 8px' }}>
          {event.summary}
        </h2>

        {/* Date & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: colors.textDim, fontSize: 13 }}>
          <Clock size={14} />
          <span>
            {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
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
          display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8,
          padding: '8px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,0.03)', fontSize: 13,
        }}>
          <LogIcon size={16} style={{ color: cat.color, marginTop: 2 }} />
          <div>
            <div style={{ color: colors.text, fontWeight: 600 }}>
              {event.logistics_type === 'transport' ? 'Drop off / Pick up' :
               event.logistics_type === 'attendance' ? 'Stay & Watch' :
               event.logistics_type === 'travel' ? 'Family Travel' : 'Heads Up'}
            </div>
            <div style={{ color: colors.textDim, fontSize: 12 }}>
              {event.parent_stays ? 'Parent stays for this activity' : 'Drop off and pick up — parent does NOT stay'}
            </div>
          </div>
        </div>

        {/* Who */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: colors.textDim, fontSize: 13 }}>
          <User size={14} />
          <span>
            {event.who?.length > 0
              ? event.who.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' + ')
              : 'Family'}
          </span>
        </div>

        {/* Note */}
        {event.note && (
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            fontSize: 12, color: colors.textDim,
          }}>
            {event.note}
          </div>
        )}

        {/* Confidence warning */}
        {event.confidence !== 'high' && (
          <div style={{
            marginTop: 8, fontSize: 11, color: '#fbbf24',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <AlertCircle size={12} />
            Auto-classified — may need review
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SummerCalendar() {
  const [events, setEvents] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | louise | kenna | family | trip | camp | school
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Firebase subscription
  useEffect(() => {
    const eventsRef = ref(db, 'kids-summer/2026/events')
    const unsub = onValue(eventsRef, (snap) => {
      const data = snap.val()
      setEvents(data || {})
      setLoading(false)
    }, (err) => {
      console.error('Firebase read error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Filter events
  const filteredEvents = useMemo(() => {
    const evs = Object.values(events)
    if (filter === 'all') return evs
    return evs.filter(e => e.category === filter)
  }, [events, filter])

  // Group by date for grid
  const eventsByDate = useMemo(() => {
    const map = {}
    filteredEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    // Sort events within each day by time
    Object.values(map).forEach(dayEvs => {
      dayEvs.sort((a, b) => (a.time_str || '').localeCompare(b.time_str || ''))
    })
    return map
  }, [filteredEvents])

  // Months to show: May (partial), June, July, August
  const MONTHS_TO_SHOW = [
    { year: 2026, month: 4 },  // May (0-indexed)
    { year: 2026, month: 5 },  // June
    { year: 2026, month: 6 },  // July
    { year: 2026, month: 7 },  // August
  ]

  // Filter pills
  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'louise', label: 'Louise' },
    { key: 'kenna', label: 'Kenna' },
    { key: 'both-kids', label: 'Both Kids' },
    { key: 'family', label: 'Family' },
    { key: 'trip', label: 'Trips' },
    { key: 'camp', label: 'Camps' },
    { key: 'school', label: 'School' },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.textDim, fontSize: 13 }}>Loading summer calendar...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, fontFamily: "'DM Sans', sans-serif",
      color: colors.text, padding: '16px 20px', maxWidth: 1200, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600,
          margin: '0 0 4px', letterSpacing: 0.5,
        }}>
          ☀️ Kids Summer 2026
        </h1>
        <p style={{ color: colors.textDim, fontSize: 13, margin: 0 }}>
          {filteredEvents.length} events · May 23 – Aug 31 · Auto-classified from family calendars
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20,
        paddingBottom: 12, borderBottom: `1px solid ${colors.divider}`,
      }}>
        {FILTERS.map(f => {
          const cat = CATEGORIES[f.key]
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px', borderRadius: 16, border: 'none',
                fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                background: active ? (cat?.bg || colors.cardHover) : 'transparent',
                color: active ? (cat?.color || colors.text) : colors.textDim,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Monthly grids */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {MONTHS_TO_SHOW.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            eventsByDate={eventsByDate}
            onEventClick={setSelectedEvent}
          />
        ))}
      </div>

      {/* Event list (chronological, below grids) */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
          All Events — Chronological
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredEvents.map((ev, i) => {
            const cat = CATEGORIES[ev.category] || CATEGORIES.family
            const d = new Date(ev.date + 'T12:00:00')
            return (
              <div
                key={i}
                onClick={() => setSelectedEvent(ev)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  border: '1px solid transparent',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.cardHover }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  minWidth: 100, color: colors.textDim, fontSize: 11,
                }}>
                  {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {ev.time_str && <span style={{marginLeft:4,opacity:0.7}}>{ev.time_str}</span>}
                </span>
                <span style={{
                  flex: 1, color: colors.text, fontWeight: 500,
                }}>
                  {ev.summary}
                  {ev.location && <span style={{color: colors.textDim, marginLeft: 6, fontSize: 10}}>@ {ev.location}</span>}
                </span>
                <span style={{
                  padding: '1px 8px', borderRadius: 8, fontSize: 10,
                  background: cat.bg, color: cat.color, fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: 10, color: colors.textDim }}>
                  {ev.logistics_type === 'transport' ? '🚗' :
                   ev.logistics_type === 'attendance' ? '👀' :
                   ev.logistics_type === 'travel' ? '✈️' : '📌'}
                </span>
                {ev.confidence !== 'high' && (
                  <span style={{ fontSize: 10, color: '#fbbf24' }} title="Needs review">⚠️</span>
                )}
              </div>
            )
          })}
          {filteredEvents.length === 0 && (
            <div style={{ color: colors.textDim, fontSize: 13, padding: 20, textAlign: 'center' }}>
              No events match this filter.
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 24, padding: 12, borderRadius: 8,
        background: colors.card, border: `1px solid ${colors.cardBorder}`,
        display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11, color: colors.textDim,
      }}>
        <strong style={{color:colors.text}}>Logistics:</strong>
        <span>🚗 Transport = drop off / pick up</span>
        <span>👀 Attendance = parent stays</span>
        <span>✈️ Travel = family trip</span>
        <span>📌 Info = FYI only</span>
        <span style={{marginLeft:'auto'}}>
          <span style={{color:'#fbbf24'}}>⚠️</span> = auto-classified, needs review
        </span>
      </div>

      {/* Event modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}
