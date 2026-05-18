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

function isSnoozed(snoozedUntil) {
  if (!snoozedUntil) return false
  return new Date(snoozedUntil) > new Date()
}

export default function LoopsSection({ loops, onDone, onSnooze }) {
  const [expanded, setExpanded] = useState(true)

  if (!loops) return null

  const visibleLoops = Object.entries(loops).filter(
    ([, loop]) => !loop.done && !isSnoozed(loop.snoozed_until)
  )

  if (visibleLoops.length === 0) return null

  const count = visibleLoops.length

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{ ...SECTION_HEADER, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ flex: 1 }}>
          🔁 Open Loops
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
            background: '#1e1e30',
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 10,
            minWidth: 20,
            height: 18,
            padding: '0 6px',
            fontSize: 10,
            color: colors.textDim,
            fontWeight: 700,
            verticalAlign: 'middle',
          }}>
            {count}
          </span>
        </span>
        <span style={{
          marginRight: 20, fontSize: 14, color: colors.textDim,
          transition: 'transform 0.15s', display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>›</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 20px' }}>
          {visibleLoops.map(([id, loop]) => (
            <div key={id} style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{ flex: 1, fontSize: 14, color: colors.text, lineHeight: 1.4 }}>
                {loop.text}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => onDone(id)}
                  style={{
                    minHeight: 36, padding: '0 12px', borderRadius: 8,
                    background: colors.accent, border: 'none',
                    color: '#fff', fontFamily: fonts.body, fontSize: 12,
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ✓ Done
                </button>
                <button
                  onClick={() => onSnooze(id)}
                  style={{
                    minHeight: 36, padding: '0 12px', borderRadius: 8,
                    background: '#1a1a28', border: `1px solid ${colors.cardBorder}`,
                    color: colors.textMuted, fontFamily: fonts.body, fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Snooze 7d
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
