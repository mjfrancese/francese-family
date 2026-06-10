import { useState, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import DayCard from '../components/DayCard'
import SectionHeader from '../components/SectionHeader'
import NowBanner from '../components/NowBanner'
import { getTripClock } from '../utils/tripClock'
import { colors, fonts } from '../theme'
import { MapPin, ChevronRight } from 'lucide-react'

// Render a run of days with section headers, as DayCards.
function renderDays(days, { expandedDays, toggleDay, clock, todayRef, selections, travelers, toggleOption, toggleTraveler }) {
  let currentSection = null
  const out = []
  for (const day of days) {
    if (day.section && day.section !== currentSection) {
      currentSection = day.section
      out.push(
        <SectionHeader key={`section-${currentSection}-${day.id}`} Icon={MapPin}>
          {currentSection}
        </SectionHeader>
      )
    }
    const isToday = clock?.todayId === day.id
    out.push(
      <div key={day.id} ref={isToday ? todayRef : undefined}>
        <DayCard
          day={day.day}
          dayNum={day.dayNum}
          month={day.month}
          title={day.title}
          events={day.events || []}
          details={day.details || []}
          expanded={expandedDays.has(day.id)}
          onToggle={() => toggleDay(day.id)}
          isToday={isToday}
          currentEventIndex={isToday ? clock?.currentEventIndex ?? -1 : -1}
          plan={day.plan || null}
          daySelections={(selections && selections[day.id]) || {}}
          travelers={travelers}
          onToggleOption={(slotId, optId) => toggleOption && toggleOption(day.id, slotId, optId)}
          onToggleTraveler={(slotId, optId, travId) => toggleTraveler && toggleTraveler(day.id, slotId, optId, travId)}
        />
      </div>
    )
  }
  return out
}

export default function DayByDay({ timeline, meta, selections = {}, travelers = [], toggleOption, toggleTraveler }) {
  const [searchParams] = useSearchParams()
  const nowOverride = searchParams.get('now') || undefined

  const clock = useMemo(
    () => getTripClock(timeline || [], meta || {}, nowOverride, selections),
    [timeline, meta, nowOverride, selections]
  )

  // Days expand independently (a Set), so opening another day never collapses
  // today. Today starts open.
  const [expandedDays, setExpandedDays] = useState(() => new Set(clock.todayId ? [clock.todayId] : []))
  const toggleDay = (id) => setExpandedDays((prev) => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })
  const [showPast, setShowPast] = useState(false)
  const todayRef = useRef(null)

  if (!timeline || timeline.length === 0) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No timeline data yet.</div>
  }

  const jumpToday = () => {
    setExpandedDays((prev) => new Set(prev).add(clock.todayId))
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // When the trip is active and time-aware, split past days behind a fold.
  const isActiveAware = clock.enabled && clock.status === 'active' && clock.todayIndex >= 0
  const pastDays = isActiveAware ? timeline.slice(0, clock.todayIndex) : []
  const restDays = isActiveAware ? timeline.slice(clock.todayIndex) : timeline

  const shared = { expandedDays, toggleDay, clock, todayRef, selections, travelers, toggleOption, toggleTraveler }

  return (
    <div>
      <NowBanner clock={clock} travelers={travelers} onJumpToday={isActiveAware ? jumpToday : undefined} />

      {/* Earlier days (collapsed) */}
      {pastDays.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setShowPast(!showPast)} style={foldBtn}>
            <ChevronRight
              size={14}
              style={{ transform: showPast ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
            />
            Earlier days ({pastDays.length})
          </button>
          {showPast && (
            <div style={{ marginTop: 8, opacity: 0.7 }}>
              {renderDays(pastDays, shared)}
            </div>
          )}
        </div>
      )}

      {renderDays(restDays, shared)}
    </div>
  )
}

const foldBtn = {
  background: 'none',
  border: 'none',
  color: colors.textDim,
  fontFamily: fonts.body,
  fontSize: 13,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 4px',
}
