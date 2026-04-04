import { useState, useMemo } from 'react'
import { colors, fonts } from '../theme'
import SectionHeader from '../components/SectionHeader'
import { Plane, Car, Clock, ArrowRight, ChevronRight, DollarSign, Calendar, Users } from 'lucide-react'

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function nightCount(departDate, returnDate) {
  const d1 = new Date(departDate)
  const d2 = new Date(returnDate)
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

const pillBase = {
  padding: '8px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  textAlign: 'center',
  border: '2px solid transparent',
}

function DatePill({ dateStr, selected, cheapest, onSelect }) {
  const active = selected === dateStr
  return (
    <button
      onClick={() => onSelect(dateStr)}
      style={{
        ...pillBase,
        background: active ? 'rgba(74, 144, 217, 0.15)' : colors.card,
        borderColor: active ? colors.accent : colors.cardBorder,
        flex: 1,
        minWidth: 100,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: active ? colors.accent : colors.text, marginBottom: 2 }}>
        {formatDay(dateStr)}
      </div>
      <div style={{ fontSize: 11, color: colors.textDim }}>
        from <span style={{ fontFamily: fonts.mono, color: cheapest <= 500 ? '#5ce892' : cheapest <= 700 ? '#e8c55c' : '#e85c5c' }}>${cheapest}</span>
      </div>
    </button>
  )
}

function FlightOption({ flight, selected, onSelect }) {
  const isSelected = selected?.flightNum === flight.flightNum && selected?.depart === flight.depart
  const nonstop = flight.stops === 0

  return (
    <div
      onClick={() => onSelect(flight)}
      style={{
        background: isSelected ? 'rgba(74, 144, 217, 0.08)' : colors.card,
        border: `2px solid ${isSelected ? colors.accent : colors.cardBorder}`,
        borderRadius: 8,
        padding: 14,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 6,
      }}
      onMouseOver={e => { if (!isSelected) e.currentTarget.style.borderColor = colors.cardBorderActive }}
      onMouseOut={e => { if (!isSelected) e.currentTarget.style.borderColor = colors.cardBorder }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: '#1a1a2e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Plane size={16} color={isSelected ? colors.accent : colors.textMuted} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{flight.depart}</span>
            <ArrowRight size={12} color={colors.textDim} />
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{flight.arrive}</span>
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            {flight.flightNum}
            <span style={{ margin: '0 6px', color: colors.textDark }}>·</span>
            {flight.duration}
            {nonstop && (
              <span style={{
                marginLeft: 6,
                padding: '1px 6px',
                background: 'rgba(92, 232, 146, 0.1)',
                border: '1px solid rgba(92, 232, 146, 0.2)',
                borderRadius: 4,
                fontSize: 10,
                color: '#5ce892',
              }}>Nonstop</span>
            )}
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          background: isSelected ? 'rgba(74, 144, 217, 0.15)' : '#1a3a2a',
          border: `1px solid ${isSelected ? colors.accent : '#2d6b45'}`,
          borderRadius: 6,
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: fonts.mono,
            fontSize: 14,
            fontWeight: 600,
            color: isSelected ? colors.accent : '#5ce892',
          }}>
            ${flight.price}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function FlightPlanner({ flightOptions }) {
  const outDates = Object.keys(flightOptions.outbound).sort()
  const retDates = Object.keys(flightOptions.return).sort()

  const [selectedOutDate, setSelectedOutDate] = useState(outDates[0])
  const [selectedRetDate, setSelectedRetDate] = useState(retDates[1])
  const [selectedOutFlight, setSelectedOutFlight] = useState(null)
  const [selectedRetFlight, setSelectedRetFlight] = useState(null)

  // Auto-select cheapest nonstop (or cheapest overall) on date change
  const outFlights = flightOptions.outbound[selectedOutDate] || []
  const retFlights = flightOptions.return[selectedRetDate] || []

  const cheapestForDate = (flights) => {
    if (!flights.length) return 0
    return Math.min(...flights.map(f => f.price))
  }

  // Trip math
  const nights = nightCount(selectedOutDate, selectedRetDate)
  const outPrice = selectedOutFlight?.price || cheapestForDate(outFlights)
  const retPrice = selectedRetFlight?.price || cheapestForDate(retFlights)
  const flightsTotal = outPrice + retPrice
  const carDays = nights + (nights > 0 ? 1 : 0)
  const carTotal = carDays * (flightOptions.rentalCarEstimate?.perDay || 75)
  const tripTotal = flightsTotal + carTotal

  return (
    <div>
      {/* Trip info banner */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 8,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} color={colors.textDim} />
          <span style={{ fontSize: 12, color: colors.textMuted }}>{flightOptions.passengers}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plane size={14} color={colors.textDim} />
          <span style={{ fontSize: 12, color: colors.textMuted }}>STL → BOS (nonstops available)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Car size={14} color={colors.textDim} />
          <span style={{ fontSize: 12, color: colors.textMuted }}>{flightOptions.rentalCarNote}</span>
        </div>
      </div>

      {/* Depart date picker */}
      <SectionHeader Icon={Calendar}>Depart STL</SectionHeader>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {outDates.map(d => (
          <DatePill
            key={d}
            dateStr={d}
            selected={selectedOutDate}
            cheapest={cheapestForDate(flightOptions.outbound[d])}
            onSelect={(date) => { setSelectedOutDate(date); setSelectedOutFlight(null) }}
          />
        ))}
      </div>

      {/* Outbound flights */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 8 }}>
          {outFlights.length} option{outFlights.length !== 1 ? 's' : ''} on {formatDay(selectedOutDate)}
          {!selectedOutFlight && <span style={{ color: colors.textDark }}> — tap to select</span>}
        </div>
        {outFlights.map((f, i) => (
          <FlightOption
            key={i}
            flight={f}
            selected={selectedOutFlight}
            onSelect={setSelectedOutFlight}
          />
        ))}
      </div>

      {/* Return date picker */}
      <SectionHeader Icon={Calendar}>Return to STL</SectionHeader>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {retDates.map(d => (
          <DatePill
            key={d}
            dateStr={d}
            selected={selectedRetDate}
            cheapest={cheapestForDate(flightOptions.return[d])}
            onSelect={(date) => { setSelectedRetDate(date); setSelectedRetFlight(null) }}
          />
        ))}
      </div>

      {/* Return flights */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 8 }}>
          {retFlights.length} option{retFlights.length !== 1 ? 's' : ''} on {formatDay(selectedRetDate)}
          {!selectedRetFlight && <span style={{ color: colors.textDark }}> — tap to select</span>}
        </div>
        {retFlights.map((f, i) => (
          <FlightOption
            key={i}
            flight={f}
            selected={selectedRetFlight}
            onSelect={setSelectedRetFlight}
          />
        ))}
      </div>

      {/* Cost summary */}
      <SectionHeader Icon={DollarSign}>Trip Estimate</SectionHeader>
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 8,
        padding: 18,
      }}>
        {/* Selected dates header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${colors.divider}`,
        }}>
          <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 600, color: colors.text }}>
            {formatDay(selectedOutDate)} — {formatDay(selectedRetDate)}
          </span>
          <div style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>
            {nights} night{nights !== 1 ? 's' : ''} in Melvin Village
          </div>
        </div>

        {/* Line items */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.divider}` }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            <Plane size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
            Outbound flight
            {selectedOutFlight && <span style={{ color: colors.textDim }}> — {selectedOutFlight.flightNum}</span>}
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.text }}>${outPrice}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.divider}` }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            <Plane size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
            Return flight
            {selectedRetFlight && <span style={{ color: colors.textDim }}> — {selectedRetFlight.flightNum}</span>}
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.text }}>${retPrice}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.divider}` }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            <Car size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
            Rental car — National Executive Aisle ({carDays} days)
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.text }}>~${carTotal}</span>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', alignItems: 'center' }}>
          <span style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 600, color: colors.text }}>
            Estimated Total
          </span>
          <span style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            fontWeight: 700,
            color: tripTotal <= 1500 ? '#5ce892' : tripTotal <= 1800 ? '#e8c55c' : '#e85c5c',
          }}>
            ~${tripTotal.toLocaleString()}
          </span>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, color: colors.textDark, marginTop: 2 }}>
          Prices as of Apr 4, 2026 — subject to change
        </div>
      </div>
    </div>
  )
}
