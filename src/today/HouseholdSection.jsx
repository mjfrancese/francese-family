import { useState } from 'react'
import { colors, fonts } from '../theme'

const SECTION_HEADER = {
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: colors.textDim,
  fontFamily: fonts.body,
  fontWeight: 600,
  padding: '20px 20px 8px',
}

const PRIORITY_COLORS = {
  action:   { bg: '#2a1a2a', border: '#6b2d6b', color: '#e85ce8', dot: '●' },
  reminder: { bg: '#3a2e1a', border: '#6b5a2d', color: '#e8c55c', dot: '◆' },
  info:     { bg: '#1a1a2a', border: '#2a2a4a', color: '#8a8aaa', dot: '·' },
}

function HouseholdCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const style = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.info
  const hasNote = item.note && item.note.trim()

  return (
    <div
      onClick={() => hasNote && setExpanded(e => !e)}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 8,
        cursor: hasNote ? 'pointer' : 'default',
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
        <span style={{ fontSize: 14, color: colors.text, flex: 1, lineHeight: 1.3 }}>
          {item.label}
        </span>
        {hasNote && (
          <span style={{ fontSize: 11, color: style.color, flexShrink: 0 }}>
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {expanded && hasNote && (
        <div style={{
          marginTop: 8,
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.5,
          paddingLeft: 24,
        }}>
          {item.note}
        </div>
      )}
    </div>
  )
}

export default function HouseholdSection({ household, viewerKey }) {
  if (!household) return null

  // Collect events for this viewer: their own + 'both'
  const myEvents = [
    ...(household[viewerKey] || []),
    ...(household.both || []),
  ]

  // De-dupe by id
  const seen = new Set()
  const events = myEvents.filter(e => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })

  // Sort: action first, then reminder, then info
  const ORDER = { action: 0, reminder: 1, info: 2 }
  events.sort((a, b) => (ORDER[a.priority] ?? 2) - (ORDER[b.priority] ?? 2))

  if (events.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>🏠 Today at Home</div>
      <div style={{ padding: '0 20px' }}>
        {events.map(item => (
          <HouseholdCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
