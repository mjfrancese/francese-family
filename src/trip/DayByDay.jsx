import { useState, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import DayCard from '../components/DayCard'
import SectionHeader from '../components/SectionHeader'
import NowBanner from '../components/NowBanner'
import { getTripClock } from '../utils/tripClock'
import { colors, fonts } from '../theme'
import { MapPin, ChevronRight } from 'lucide-react'

// Render a run of days with section headers, as DayCards.
function renderDays(days, { expandedDay, setExpandedDay, clock, todayRef }) {
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
          expanded={expandedDay === day.id}
          onToggle={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
          isToday={isToday}
          currentEventIndex={isToday ? clock?.currentEventIndex ?? -1 : -1}
        />
      </div>
    )
  }
  return out
}

export default function DayByDay({ timeline, meta }) {
  const [searchParams] = useSearchParams()
  const nowOverride = searchParams.get('now') || undefined

  const clock = useMemo(
    () => getTripClock(timeline || [], meta || {}, nowOverride),
    [timeline, meta, nowOverride]
  )

  // Default the open day to today (when the trip is active).
  const [expandedDay, setExpandedDay] = useState(() => clock.todayId || null)
  const [showPast, setShowPast] = useState(false)
  const todayRef = useRef(null)

  if (!timeline || timeline.length === 0) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No timeline data yet.</div>
  }

  const jumpToday = () => {
    setExpandedDay(clock.todayId)
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // When the trip is active and time-aware, split past days behind a fold.
  const isActiveAware = clock.enabled && clock.status === 'active' && clock.todayIndex >= 0
  const pastDays = isActiveAware ? timeline.slice(0, clock.todayIndex) : []
  const restDays = isActiveAware ? timeline.slice(clock.todayIndex) : timeline

  const shared = { expandedDay, setExpandedDay, clock, todayRef }

  return (
    <div>
      <NowBanner clock={clock} onJumpToday={isActiveAware ? jumpToday : undefined} />

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
  fontSize: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 0',
}
