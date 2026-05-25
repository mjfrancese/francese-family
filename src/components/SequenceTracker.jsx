import { colors, fonts } from '../theme'

const STEP_STATUS_CONFIG = {
  done:        { color: '#5ce892', bg: '#1a2a1a', border: '#2d4a2d', label: 'Done' },
  'in-progress': { color: '#4a90d9', bg: '#1a1a2a', border: '#2d3a5a', label: 'In Progress' },
  waiting:     { color: '#e8c55c', bg: '#2a2a1a', border: '#4a4a2d', label: 'Waiting' },
  open:        { color: '#8a8aaa', bg: '#141420', border: '#2a2a3a', label: 'Open' },
  pending:     { color: '#6a6a8a', bg: '#0d0d18', border: '#1a1a2a', label: 'Pending' },
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr + 'T12:00:00') - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function SequenceTracker({ sequences }) {
  if (!sequences || sequences.length === 0) return null

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontFamily: fonts.heading,
        fontSize: 16,
        fontWeight: 600,
        color: colors.text,
        margin: '0 0 12px',
        letterSpacing: 0.3,
      }}>
        Sequences
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sequences.map(seq => {
          const steps = seq.steps || []
          const doneCount = steps.filter(s => s.status === 'done').length
          const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0
          const currentStep = steps.find(s => s.status === 'in-progress' || s.status === 'open' || s.status === 'waiting')
          const days = daysUntil(seq.due)

          return (
            <div
              key={seq.id}
              style={{
                background: colors.card,
                border: `1px solid ${colors.cardBorder}`,
                borderLeft: `3px solid ${seq.color || colors.accent}`,
                borderRadius: 8,
                padding: '12px 16px',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: 13,
                  color: colors.text,
                  flex: 1,
                }}>
                  {seq.title}
                </span>
                <span style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  color: colors.textDim,
                }}>
                  {doneCount}/{steps.length}
                </span>
                {seq.due && (
                  <span style={{
                    fontSize: 10,
                    fontFamily: fonts.mono,
                    color: days !== null && days <= 14 ? '#e8c55c' : colors.textDark,
                  }}>
                    {days !== null && days <= 0 ? 'overdue' : days !== null ? `${days}d` : seq.due}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div style={{
                height: 3,
                background: '#1a1a2a',
                borderRadius: 2,
                marginBottom: 10,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: seq.color || colors.accent,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }} />
              </div>

              {/* Step pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {steps.map((step, i) => {
                  const sc = STEP_STATUS_CONFIG[step.status] || STEP_STATUS_CONFIG.pending
                  const isActive = step.status === 'in-progress' || step.status === 'open' || step.status === 'waiting'
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '3px 9px',
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        borderRadius: 10,
                        fontSize: 11,
                        color: sc.color,
                        fontFamily: fonts.body,
                        fontWeight: isActive ? 600 : 400,
                        opacity: step.status === 'pending' ? 0.5 : 1,
                      }}
                      title={step.completed ? `Completed: ${step.completed}` : undefined}
                    >
                      {i + 1}. {step.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
