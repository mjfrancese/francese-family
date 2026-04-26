import { useState } from 'react'
import { colors, fonts } from '../theme'
import SectionHeader from '../components/SectionHeader'
import { Plane, Car, ArrowRight, DollarSign, Calendar, Users, Star } from 'lucide-react'

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

function priceColor(price, min, max) {
  if (min === max) return '#5ce892'
  const ratio = (price - min) / (max - min)
  if (ratio <= 0.33) return '#5ce892'
  if (ratio <= 0.66) return '#e8c55c'
  return '#e85c5c'
}

function DatePill({ dateStr, selected, cheapest, priceMin, priceMax, onSelect }) {
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
        from <span style={{ fontFamily: fonts.mono, color: priceColor(cheapest, priceMin, priceMax) }}>${cheapest}</span>
      </div>
    </button>
  )
}

function CarOption({ option, isSelected, onSelect }) {
  const tagColors = {
    Recommended: { bg: 'rgba(92, 232, 146, 0.1)', border: 'rgba(92, 232, 146, 0.2)', text: '#5ce892' },
    Cheapest: { bg: 'rgba(74, 144, 217, 0.1)', border: 'rgba(74, 144, 217, 0.2)', text: colors.accent },
    Stretch: { bg: 'rgba(232, 197, 92, 0.1)', border: 'rgba(232, 197, 92, 0.2)', text: '#e8c55c' },
  }
  const days = option.days || 1
  const perDay = option.pricePerDay || (option.total ? Math.round(option.total / days) : 0)

  return (
    <div
      onClick={() => onSelect(option)}
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
          <Car size={16} color={isSelected ? colors.accent : colors.textMuted} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{option.brand}</span>
            <span style={{ fontSize: 12, color: colors.textMuted }}>· {option.vehicle}</span>
            {(option.tags || []).map(tag => {
              const tc = tagColors[tag] || tagColors.Recommended
              return (
                <span key={tag} style={{
                  padding: '1px 6px',
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  borderRadius: 4,
                  fontSize: 10,
                  color: tc.text,
                }}>{tag}</span>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            {option.loyalty && (
              <span style={{ color: '#b88ad9' }}>
                <Star size={8} style={{ verticalAlign: 0, marginRight: 2 }} />{option.loyalty}
              </span>
            )}
            {option.loyalty && <span style={{ margin: '0 6px', color: colors.textDark }}>·</span>}
            {perDay > 0 && <span>${perDay}/day</span>}
            {perDay > 0 && <span style={{ margin: '0 6px', color: colors.textDark }}>·</span>}
            <span>{days} day{days !== 1 ? 's' : ''}</span>
            {option.notes && <span style={{ color: colors.textDark }}> · {option.notes}</span>}
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
            ${option.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
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

  // Trip-specific labels — fall back to NH defaults so existing trip keeps rendering
  const route = flightOptions.route || 'STL → BOS nonstop'
  const lodgingLabel = flightOptions.lodgingLabel || 'Melvin Village'
  const carBrand = flightOptions.carBrand || 'Avis'
  const carStatusLabel = flightOptions.carStatusLabel || "President's Club"
  const priceAsOfNote = flightOptions.priceAsOfNote || 'Prices as of Apr 4, 2026 via Google Flights + Avis.com — subject to change'

  // Rental car options: new picker mode if rentalCarOptions array is present
  const carOptions = Array.isArray(flightOptions.rentalCarOptions) ? flightOptions.rentalCarOptions : null
  const recommendedCar = carOptions?.find(o => (o.tags || []).includes('Recommended')) || carOptions?.[0] || null

  const [selectedOutDate, setSelectedOutDate] = useState(outDates[0])
  const [selectedRetDate, setSelectedRetDate] = useState(retDates[1] || retDates[0])
  const [selectedOutFlight, setSelectedOutFlight] = useState(null)
  const [selectedRetFlight, setSelectedRetFlight] = useState(null)
  const [selectedCarId, setSelectedCarId] = useState(recommendedCar?.id || null)

  const outFlights = flightOptions.outbound[selectedOutDate] || []
  const retFlights = flightOptions.return[selectedRetDate] || []

  const cheapestForDate = (flights) => {
    if (!flights.length) return 0
    return Math.min(...flights.map(f => f.price))
  }

  // Compute price ranges for relative green/yellow/red coloring
  const outCheapests = outDates.map(d => cheapestForDate(flightOptions.outbound[d]))
  const retCheapests = retDates.map(d => cheapestForDate(flightOptions.return[d]))
  const outMin = Math.min(...outCheapests), outMax = Math.max(...outCheapests)
  const retMin = Math.min(...retCheapests), retMax = Math.max(...retCheapests)

  // Rental car pricing — picker mode (rentalCarOptions) or legacy lookup mode (rentalCarPricing)
  let carPrice, carDays, carPerDay, carBrandLabel, carStatusLabelActive
  if (carOptions) {
    const sel = carOptions.find(o => o.id === selectedCarId) || carOptions[0]
    carPrice = sel?.total || 0
    carDays = sel?.days || nightCount(selectedOutDate, selectedRetDate)
    carPerDay = sel?.pricePerDay || (carPrice && carDays ? Math.round(carPrice / carDays) : 0)
    carBrandLabel = sel?.brand || carBrand
    carStatusLabelActive = sel?.loyalty || carStatusLabel
  } else {
    const carKey = `${selectedOutDate}_${selectedRetDate}`
    const carPricing = flightOptions.rentalCarPricing?.[carKey]
    carDays = carPricing?.days || nightCount(selectedOutDate, selectedRetDate)
    carPrice = carPricing?.total || 0
    carPerDay = carPrice ? Math.round(carPrice / carDays) : 0
    carBrandLabel = carBrand
    carStatusLabelActive = carStatusLabel
  }

  // Trip math
  const nights = nightCount(selectedOutDate, selectedRetDate)
  const outPrice = selectedOutFlight?.price || cheapestForDate(outFlights)
  const retPrice = selectedRetFlight?.price || cheapestForDate(retFlights)
  const flightsTotal = outPrice + retPrice
  const tripTotal = flightsTotal + carPrice

  // Total color range — use rentalCarOptions prices in picker mode, otherwise rentalCarPricing
  const allCarPrices = carOptions
    ? carOptions.map(o => o.total || 0).filter(p => p > 0)
    : Object.values(flightOptions.rentalCarPricing || {}).map(p => p.total || 0)
  const minCar = allCarPrices.length ? Math.min(...allCarPrices) : 0
  const maxCar = allCarPrices.length ? Math.max(...allCarPrices) : 0
  const minTotal = outMin + retMin + minCar
  const maxTotal = outMax + retMax + maxCar

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
          <span style={{ fontSize: 12, color: colors.textMuted }}>{route}</span>
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
            priceMin={outMin}
            priceMax={outMax}
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
          <FlightOption key={i} flight={f} selected={selectedOutFlight} onSelect={setSelectedOutFlight} />
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
            priceMin={retMin}
            priceMax={retMax}
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
          <FlightOption key={i} flight={f} selected={selectedRetFlight} onSelect={setSelectedRetFlight} />
        ))}
      </div>

      {/* Rental car info */}
      <SectionHeader Icon={Car}>Rental Car</SectionHeader>
      {carOptions ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: colors.textDim, marginBottom: 8 }}>
            {carOptions.length} option{carOptions.length !== 1 ? 's' : ''} — tap to select
          </div>
          {carOptions.map(opt => (
            <CarOption
              key={opt.id}
              option={opt}
              isSelected={opt.id === selectedCarId}
              onSelect={(o) => setSelectedCarId(o.id)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 8,
          padding: 14,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: '#1a1a2e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Car size={16} color={colors.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{carBrandLabel}</span>
                <span style={{
                  padding: '1px 6px',
                  background: 'rgba(184, 138, 217, 0.1)',
                  border: '1px solid rgba(184, 138, 217, 0.2)',
                  borderRadius: 4,
                  fontSize: 10,
                  color: '#b88ad9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Star size={8} /> {carStatusLabelActive}
                </span>
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                {carDays}-day rental, {formatDay(selectedOutDate)} to {formatDay(selectedRetDate)}
                {carPerDay > 0 && <span style={{ color: colors.textDark }}> · ${carPerDay}/day</span>}
              </div>
            </div>
            {carPrice ? (
              <div style={{
                padding: '4px 10px',
                background: '#1a3a2a',
                border: '1px solid #2d6b45',
                borderRadius: 6,
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: fonts.mono,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#5ce892',
                }}>
                  ${carPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: '#e8c55c' }}>No pricing</span>
            )}
          </div>
        </div>
      )}

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
            {nights} night{nights !== 1 ? 's' : ''} in {lodgingLabel}
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
            {carBrandLabel} rental ({carDays} days)
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.text }}>
            {carPrice ? `$${carPrice.toLocaleString()}` : 'N/A'}
          </span>
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
            color: priceColor(tripTotal, minTotal, maxTotal),
          }}>
            {carPrice ? `~$${tripTotal.toLocaleString()}` : '—'}
          </span>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, color: colors.textDark, marginTop: 2 }}>
          {priceAsOfNote}
        </div>
      </div>
    </div>
  )
}
