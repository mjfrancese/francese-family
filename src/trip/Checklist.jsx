import { useState } from 'react'
import { colors, fonts } from '../theme'
import { ChevronRight, Check } from 'lucide-react'

export default function Checklist({ items, toggle }) {
  const [showCompleted, setShowCompleted] = useState(false)

  if (!items || items.length === 0) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No checklist items yet.</div>
  }

  const doneCount = items.filter(i => i.done).length
  const pct = items.length > 0 ? (doneCount / items.length) * 100 : 0

  // Group items
  const groups = {}
  const doneItems = []
  for (const item of items) {
    if (item.done) {
      doneItems.push(item)
    } else {
      const group = item.group || 'normal'
      if (!groups[group]) groups[group] = []
      groups[group].push(item)
    }
  }

  const groupConfig = {
    'this-week': { bg: '#2a1a1a', border: '#4a2a2a', label: '#e85c5c', title: 'Do This Week' },
    'urgent': { bg: '#2a1a1a', border: '#4a2a2a', label: '#e85c5c', title: 'Urgent' },
    'planning': { bg: '#1a1a2a', border: '#2a2a4a', label: '#4a90d9', title: 'Planning' },
    'april': { bg: '#2a2a1a', border: '#4a4a2a', label: '#e8c55c', title: 'Before Travel — April' },
    'may': { bg: '#2a1a2a', border: '#4a2a4a', label: '#b88ad9', title: 'Before Travel — May' },
    'june': { bg: '#1a1a2a', border: '#2a2a4a', label: '#4a90d9', title: 'Before Travel — June' },
    'july': { bg: '#1a2a1a', border: '#2a4a2a', label: '#5ce892', title: 'Before Travel — July' },
    'packing': { bg: '#1a2a2a', border: '#2a4a4a', label: '#8a8aaa', title: 'Packing & Prep' },
    'normal': { bg: '#1a1a2a', border: '#2a2a4a', label: '#8a8aaa', title: 'To Do' },
  }

  const groupOrder = ['this-week', 'urgent', 'planning', 'april', 'may', 'june', 'july', 'packing', 'normal']

  // Add any groups from data that aren't in groupOrder (catch-all)
  for (const item of items) {
    const g = item.group || 'normal'
    if (!groupOrder.includes(g)) {
      groupOrder.push(g)
      groupConfig[g] = { bg: '#1a1a2a', border: '#2a2a4a', label: '#8a8aaa', title: g.charAt(0).toUpperCase() + g.slice(1).replace(/-/g, ' ') }
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{
        marginBottom: 20,
        padding: '12px 16px',
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 8,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {doneCount} of {items.length} complete
          </span>
          <span style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: pct === 100 ? '#5ce892' : colors.textDim,
          }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div style={{
          height: 6,
          background: '#1a1a2a',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: '#34d399',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Active groups */}
      {groupOrder.map(groupKey => {
        const groupItems = groups[groupKey]
        if (!groupItems || groupItems.length === 0) return null
        const config = groupConfig[groupKey] || groupConfig.normal

        return (
          <div key={groupKey} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11,
              fontFamily: fonts.mono,
              letterSpacing: 1.5,
              color: config.label,
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingBottom: 4,
              borderBottom: `1px solid ${config.border}`,
            }}>
              {config.title}
            </div>
            {groupItems.map(item => (
              <ChecklistItem key={item.id} item={item} onToggle={() => toggle(item.id)} />
            ))}
          </div>
        )
      })}

      {/* Completed section */}
      {doneItems.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textDark,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: fonts.body,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <ChevronRight
              size={14}
              style={{
                transform: showCompleted ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
            Completed ({doneItems.length})
          </button>
          {showCompleted && doneItems.map(item => (
            <ChecklistItem key={item.id} item={item} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ item, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 12px',
        marginBottom: 4,
        borderRadius: 6,
        cursor: 'pointer',
        background: item.done ? 'rgba(52,211,153,0.04)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
      onMouseOver={e => { if (!item.done) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      onMouseOut={e => { e.currentTarget.style.background = item.done ? 'rgba(52,211,153,0.04)' : 'transparent' }}
    >
      {/* Checkbox */}
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: item.done ? 'none' : `2px solid ${colors.border}`,
        background: item.done ? '#059669' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
        transition: 'all 0.15s ease',
      }}>
        {item.done && (
          <Check size={12} color="#fff" strokeWidth={3} />
        )}
      </div>

      {/* Text */}
      <span style={{
        fontSize: 13,
        lineHeight: 1.5,
        color: item.done ? colors.textDark : colors.text,
        textDecoration: item.done ? 'line-through' : 'none',
        flex: 1,
      }}>
        {item.text}
      </span>

      {/* Urgent badge */}
      {item.urgent && !item.done && (
        <span style={{
          padding: '2px 6px',
          background: 'rgba(251,191,36,0.15)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 4,
          fontSize: 9,
          fontFamily: fonts.mono,
          fontWeight: 600,
          letterSpacing: 1,
          color: '#fbbf24',
          flexShrink: 0,
        }}>
          URGENT
        </span>
      )}
    </div>
  )
}
