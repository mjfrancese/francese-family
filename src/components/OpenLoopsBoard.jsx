import { useState } from 'react'
import { colors, fonts } from '../theme'
import { CheckSquare, Square, Clock, AlertCircle, Loader } from 'lucide-react'

const URGENCY_COLORS = {
  high:   { color: '#e85c5c', border: '#6b2d2d', bg: '#2a1a1a', dot: '#e85c5c' },
  medium: { color: '#e8c55c', border: '#6b5a2d', bg: '#2a2a1a', dot: '#e8c55c' },
  low:    { color: '#8a8aaa', border: '#2a2a4a', bg: '#141420', dot: '#4a4a6a' },
}

const STATUS_ICONS = {
  open:    <Square size={14} />,
  waiting: <Loader size={14} />,
  done:    <CheckSquare size={14} />,
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr + 'T12:00:00') - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function DueBadge({ due, status }) {
  if (!due || status === 'done') return null
  const days = daysUntil(due)
  const color = days <= 3 ? '#e85c5c' : days <= 14 ? '#e8c55c' : '#8a8aaa'
  const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d`
  return (
    <span style={{
      fontSize: 10,
      color,
      fontFamily: fonts.mono,
      letterSpacing: 0.5,
      padding: '2px 6px',
      border: `1px solid ${color}44`,
      borderRadius: 8,
    }}>
      {label}
    </span>
  )
}

export default function OpenLoopsBoard({ loops, onMarkDone, onMarkOpen }) {
  const [collapsed, setCollapsed] = useState(false)

  const open = loops.filter(l => l.status !== 'done')
  const done = loops.filter(l => l.status === 'done')

  if (open.length === 0 && done.length === 0) return null

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <h2 style={{
          fontFamily: fonts.heading,
          fontSize: 16,
          fontWeight: 600,
          color: colors.text,
          margin: 0,
          letterSpacing: 0.3,
        }}>
          Open Loops
        </h2>
        <span style={{
          fontSize: 11,
          color: colors.textDim,
          fontFamily: fonts.mono,
          padding: '2px 7px',
          background: '#1a1a2a',
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
        }}>
          {open.length}
        </span>
        <span style={{ fontSize: 11, color: colors.textDark, marginLeft: 'auto' }}>
          {collapsed ? '▸' : '▾'}
        </span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {open.map(loop => {
            const uc = URGENCY_COLORS[loop.urgency] || URGENCY_COLORS.low
            return (
              <div
                key={loop.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  background: uc.bg,
                  border: `1px solid ${uc.border}`,
                  borderRadius: 8,
                  borderLeft: `3px solid ${uc.dot}`,
                }}
              >
                <button
                  onClick={() => onMarkDone(loop.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: uc.color,
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                  title="Mark done"
                >
                  {STATUS_ICONS[loop.status] || <Square size={14} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: loop.blocked_on ? 3 : 0,
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.text,
                      fontFamily: fonts.body,
                    }}>
                      {loop.title}
                    </span>
                    <DueBadge due={loop.due} status={loop.status} />
                    {loop.business_hours_only && (
                      <span style={{
                        fontSize: 10,
                        color: '#8a8aaa',
                        fontFamily: fonts.mono,
                      }}>
                        ☎ business hrs
                      </span>
                    )}
                    {loop.est_minutes && (
                      <span style={{
                        fontSize: 10,
                        color: '#6a6a8a',
                        fontFamily: fonts.mono,
                      }}>
                        ~{loop.est_minutes}m
                      </span>
                    )}
                  </div>
                  {loop.blocked_on && (
                    <div style={{
                      fontSize: 11,
                      color: colors.textDark,
                      fontFamily: fonts.body,
                    }}>
                      {loop.blocked_on}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {done.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {done.map(loop => (
                <div
                  key={loop.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '7px 14px',
                    opacity: 0.45,
                  }}
                >
                  <button
                    onClick={() => onMarkOpen(loop.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5ce892',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                    }}
                    title="Reopen"
                  >
                    <CheckSquare size={14} />
                  </button>
                  <span style={{
                    fontSize: 12,
                    color: colors.textDim,
                    fontFamily: fonts.body,
                    textDecoration: 'line-through',
                  }}>
                    {loop.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
