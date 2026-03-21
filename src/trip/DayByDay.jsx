import { useState } from 'react'
import DayCard from '../components/DayCard'
import SectionHeader from '../components/SectionHeader'
import { colors } from '../theme'

export default function DayByDay({ timeline }) {
  const [expandedDay, setExpandedDay] = useState(null)

  if (!timeline || timeline.length === 0) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No timeline data yet.</div>
  }

  // Group days by section
  let currentSection = null
  const elements = []

  for (const day of timeline) {
    if (day.section && day.section !== currentSection) {
      currentSection = day.section
      elements.push(
        <SectionHeader key={`section-${currentSection}`} icon={day.sectionIcon || '📍'}>
          {currentSection}
        </SectionHeader>
      )
    }

    elements.push(
      <DayCard
        key={day.id}
        day={day.day}
        dayNum={day.dayNum}
        month={day.month}
        title={day.title}
        events={day.events || []}
        details={day.details || []}
        expanded={expandedDay === day.id}
        onToggle={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
      />
    )
  }

  return <div>{elements}</div>
}
