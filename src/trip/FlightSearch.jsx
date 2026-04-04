import { useState } from 'react'
import { colors, fonts, styles } from '../theme'
import SectionHeader from '../components/SectionHeader'
import { Search, Plane, Clock, ArrowRight, ChevronRight, AlertTriangle, Loader } from 'lucide-react'

const CABIN_OPTIONS = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
]

const STOPS_OPTIONS = [
  { value: 'ANY', label: 'Any stops' },
  { value: 'NON_STOP', label: 'Nonstop only' },
  { value: 'ONE_STOP_OR_FEWER', label: '1 stop or fewer' },
  { value: 'TWO_OR_FEWER_STOPS', label: '2 stops or fewer' },
]

const SORT_OPTIONS = [
  { value: 'BEST', label: 'Best' },
  { value: 'CHEAPEST', label: 'Cheapest' },
  { value: 'DURATION', label: 'Shortest' },
  { value: 'DEPARTURE_TIME', label: 'Departure' },
]

const inputStyle = {
  padding: '10px 12px',
  background: '#1a1a2e',
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  color: colors.text,
  fontSize: 13,
  fontFamily: fonts.body,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8aaa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 30,
}

const labelStyle = {
  fontSize: 11,
  color: colors.textDim,
  marginBottom: 4,
  display: 'block',
  fontWeight: 500,
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function FlightCard({ flight, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const firstLeg = flight.legs[0]
  const lastLeg = flight.legs[flight.legs.length - 1]
  const stopsLabel = flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`
  const airlines = [...new Set(flight.legs.map(l => l.airline))].join(', ')

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${expanded ? colors.cardBorderActive : colors.cardBorder}`,
      borderRadius: 8,
      marginBottom: 8,
      transition: 'border-color 0.15s ease',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          cursor: 'pointer',
        }}
        onMouseOver={e => e.currentTarget.style.background = colors.cardHover}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Airline icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: '#1a1a2e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Plane size={18} color={colors.textMuted} />
        </div>

        {/* Route & times */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: colors.text }}>
              {formatTime(firstLeg.departure)}
            </span>
            <ArrowRight size={12} color={colors.textDim} />
            <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: colors.text }}>
              {formatTime(lastLeg.arrival)}
            </span>
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            {airlines} &middot; {firstLeg.from} → {lastLeg.to} &middot; {stopsLabel}
          </div>
        </div>

        {/* Duration */}
        <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
          <div style={{ fontSize: 11, color: colors.textDim, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            <Clock size={10} />
            {flight.durationFormatted}
          </div>
        </div>

        {/* Price */}
        <div style={{
          padding: '4px 10px',
          background: '#1a3a2a',
          border: '1px solid #2d6b45',
          borderRadius: 6,
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 600, color: '#5ce892', letterSpacing: 0.3 }}>
            ${Math.round(flight.price)}
          </span>
        </div>

        <ChevronRight
          size={16}
          color={colors.textDim}
          style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        />
      </div>

      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: 12,
        }}>
          {flight.legs.map((leg, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '8px 0',
              borderBottom: i < flight.legs.length - 1 ? `1px solid ${colors.divider}` : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: '#1a1a2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                <Plane size={14} color={colors.textDim} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 2 }}>
                  {leg.airline} {leg.flightNumber}
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
                  {leg.from} {formatTime(leg.departure)} → {leg.to} {formatTime(leg.arrival)}
                </div>
                <div style={{ fontSize: 11, color: colors.textDim }}>
                  {formatDate(leg.departure)} &middot; {leg.durationFormatted}
                </div>
              </div>
            </div>
          ))}

          {onSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(flight) }}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px 0',
                background: colors.accent,
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 13,
                fontFamily: fonts.body,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Select this flight
            </button>
          )}
        </div>
      )}
    </div>
  )
}


export default function FlightSearch({ meta }) {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    date: '',
    returnDate: '',
    adults: 2,
    children: 0,
    cabin: 'ECONOMY',
    stops: 'ANY',
    sort: 'BEST',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [saved, setSaved] = useState([])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  async function handleSearch(e) {
    e.preventDefault()
    if (!form.origin || !form.destination || !form.date) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const body = {
        origin: form.origin.toUpperCase(),
        destination: form.destination.toUpperCase(),
        date: form.date,
        adults: form.adults,
        children: form.children,
        cabin: form.cabin,
        stops: form.stops,
        sort: form.sort,
      }
      if (form.returnDate) body.return_date = form.returnDate

      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Search failed (${res.status})`)
      }

      setResults(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSave(flight, direction) {
    setSaved(prev => [...prev, { ...flight, direction, savedAt: new Date().toISOString() }])
  }

  const hasOneWay = results?.flights?.length > 0
  const hasOutbound = results?.outbound?.length > 0
  const hasReturn = results?.returnFlights?.length > 0
  const noResults = results && !hasOneWay && !hasOutbound && !hasReturn

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
        }}>
          {/* Row 1: airports + dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>From</label>
              <input
                style={inputStyle}
                placeholder="JFK"
                value={form.origin}
                onChange={e => update('origin', e.target.value)}
                maxLength={3}
              />
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <input
                style={inputStyle}
                placeholder="LHR"
                value={form.destination}
                onChange={e => update('destination', e.target.value)}
                maxLength={3}
              />
            </div>
            <div>
              <label style={labelStyle}>Depart</label>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: 'dark' }}
                value={form.date}
                onChange={e => update('date', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Return</label>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: 'dark' }}
                value={form.returnDate}
                onChange={e => update('returnDate', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Row 2: passengers + filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Adults</label>
              <select style={selectStyle} value={form.adults} onChange={e => update('adults', +e.target.value)}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Children</label>
              <select style={selectStyle} value={form.children} onChange={e => update('children', +e.target.value)}>
                {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cabin</label>
              <select style={selectStyle} value={form.cabin} onChange={e => update('cabin', e.target.value)}>
                {CABIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stops</label>
              <select style={selectStyle} value={form.stops} onChange={e => update('stops', e.target.value)}>
                {STOPS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sort by</label>
              <select style={selectStyle} value={form.sort} onChange={e => update('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Search button */}
          <button
            type="submit"
            disabled={loading || !form.origin || !form.destination || !form.date}
            style={{
              width: '100%',
              padding: '12px 0',
              background: loading ? colors.border : colors.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 14,
              fontFamily: fonts.body,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: (!form.origin || !form.destination || !form.date) ? 0.5 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Searching Google Flights...
              </>
            ) : (
              <>
                <Search size={16} />
                Search Flights
              </>
            )}
          </button>
        </div>
      </form>

      {/* Spinner animation */}
      {loading && (
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(232, 92, 92, 0.08)',
          border: '1px solid rgba(232, 92, 92, 0.2)',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertTriangle size={16} color="#e85c5c" />
          <span style={{ fontSize: 13, color: '#e85c5c' }}>{error}</span>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div style={{ textAlign: 'center', padding: 40, color: colors.textDim, fontSize: 13 }}>
          No flights found. Try different dates or airports.
        </div>
      )}

      {/* One-way results */}
      {hasOneWay && (
        <div>
          <SectionHeader Icon={Plane}>
            {results.flights.length} flight{results.flights.length !== 1 ? 's' : ''} found
          </SectionHeader>
          {results.flights.map((f, i) => (
            <FlightCard key={i} flight={f} onSelect={(fl) => handleSave(fl, 'outbound')} />
          ))}
        </div>
      )}

      {/* Round-trip outbound */}
      {hasOutbound && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader Icon={Plane}>
            Outbound — {results.outbound.length} option{results.outbound.length !== 1 ? 's' : ''}
          </SectionHeader>
          {results.outbound.map((f, i) => (
            <FlightCard key={i} flight={f} onSelect={(fl) => handleSave(fl, 'outbound')} />
          ))}
        </div>
      )}

      {/* Round-trip return */}
      {hasReturn && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader Icon={Plane}>
            Return — {results.returnFlights.length} option{results.returnFlights.length !== 1 ? 's' : ''}
          </SectionHeader>
          {results.returnFlights.map((f, i) => (
            <FlightCard key={i} flight={f} onSelect={(fl) => handleSave(fl, 'return')} />
          ))}
        </div>
      )}

      {/* Saved / shortlisted flights */}
      {saved.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <SectionHeader Icon={Plane}>Shortlisted ({saved.length})</SectionHeader>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(74, 144, 217, 0.08)',
            border: '1px solid rgba(74, 144, 217, 0.2)',
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 11,
            color: colors.textMuted,
          }}>
            Your saved flights for comparison. These are stored locally for this session.
          </div>
          {saved.map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}>
                <button
                  onClick={() => setSaved(prev => prev.filter((_, j) => j !== i))}
                  style={{
                    background: 'rgba(232, 92, 92, 0.15)',
                    border: '1px solid rgba(232, 92, 92, 0.3)',
                    borderRadius: 4,
                    color: '#e85c5c',
                    fontSize: 10,
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontFamily: fonts.body,
                  }}
                >
                  Remove
                </button>
              </div>
              <FlightCard flight={f} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
