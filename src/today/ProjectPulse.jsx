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

const PRIORITY_BADGE = {
  high: { bg: '#3a1a1a', color: '#e85c5c', border: '#6b2d2d', label: 'HIGH' },
  medium: { bg: '#3a2e1a', color: '#e8c55c', border: '#6b5a2d', label: 'MED' },
  low: { bg: '#1a1a2a', color: colors.textDim, border: '#2a2a3a', label: 'LOW' },
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const HIDDEN_STATUSES = ['done', 'hiatus']
const STALLED_STATUSES = ['stalled', 'blocked']

function PriorityBadge({ priority }) {
  const style = PRIORITY_BADGE[priority] || PRIORITY_BADGE.low
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 4,
      padding: '2px 6px',
    }}>
      {style.label}
    </span>
  )
}

function DaysAgo({ days }) {
  if (days == null) return null
  const color = days > 30 ? '#e85c5c' : days > 14 ? '#e8c55c' : colors.textDark
  return (
    <span style={{ fontSize: 11, color, fontFamily: fonts.body }}>
      {days}d
    </span>
  )
}

function ProjectCard({ slug, project, onDone, onLog }) {
  const {
    label, emoji, priority, status, next_action,
    last_log, days_since_update, done_today,
  } = project

  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [optimisticLastLog, setOptimisticLastLog] = useState(null)

  const isStalled = STALLED_STATUSES.includes(status)
  const displayLastLog = optimisticLastLog || last_log
  const truncated = displayLastLog && displayLastLog.length > 80
    ? displayLastLog.slice(0, 80) + '…'
    : displayLastLog

  function handleNoteSubmit() {
    if (noteText.trim()) {
      setOptimisticLastLog(noteText.trim())
      onLog(slug, noteText.trim())
    }
    setShowNote(false)
    setNoteText('')
  }

  function handleNoteKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNoteSubmit()
    }
    if (e.key === 'Escape') {
      setShowNote(false)
      setNoteText('')
    }
  }

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderLeft: isStalled ? '3px solid #e8c55c' : `1px solid ${colors.cardBorder}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {done_today && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,58,42,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, zIndex: 1,
        }}>
          <span style={{ color: colors.status.booked.color, fontWeight: 700, fontSize: 15 }}>
            ✓ Done for today
          </span>
        </div>
      )}

      {/* Title row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 8, marginBottom: 12,
      }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: colors.text, flex: 1 }}>{label}</span>
        <PriorityBadge priority={priority} />
        <DaysAgo days={days_since_update} />
      </div>

      {/* NEXT section */}
      {next_action && (
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#e8c55c',
            marginBottom: 4,
          }}>
            Next
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
            {next_action}
          </div>
        </div>
      )}

      {/* LATEST section */}
      {truncated && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: colors.textDim,
            marginBottom: 4,
          }}>
            Latest
          </div>
          <div style={{ fontSize: 12, color: colors.textDim, lineHeight: 1.5, fontStyle: 'italic' }}>
            {truncated}
          </div>
        </div>
      )}

      {/* Days since update note */}
      {days_since_update != null && days_since_update > 0 && (
        <div style={{
          fontSize: 11, color: colors.textDark,
          marginBottom: 12,
          fontStyle: 'italic',
        }}>
          {days_since_update} day{days_since_update !== 1 ? 's' : ''} since last update
        </div>
      )}

      {/* Inline note input */}
      {showNote && (
        <textarea
          autoFocus
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onBlur={handleNoteSubmit}
          onKeyDown={handleNoteKeyDown}
          placeholder="Quick note… (Enter to save)"
          rows={2}
          style={{
            width: '100%',
            background: '#0d0d18',
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 8,
            color: colors.text,
            fontFamily: fonts.body,
            fontSize: 13,
            padding: '8px 10px',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            marginBottom: 10,
          }}
        />
      )}

      {/* Action buttons */}
      {!done_today && (
        <div style={{ display: 'flex', gap: 8 }}>
          {!isStalled && (
            <button
              onClick={() => onDone(slug)}
              style={{
                flex: 1, minHeight: 36, borderRadius: 8,
                background: colors.accent, border: 'none',
                color: '#fff', fontFamily: fonts.body, fontSize: 12,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              ✓ Did the thing
            </button>
          )}
          <button
            onClick={() => { setShowNote(v => !v); setNoteText('') }}
            style={{
              flex: isStalled ? 1 : 0,
              minHeight: 36,
              padding: isStalled ? undefined : '0 14px',
              borderRadius: 8,
              background: '#1a1a28',
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textMuted,
              fontFamily: fonts.body,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            📝 Note
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProjectPulse({ projects, todayDate, onDone, onLog }) {
  const [expanded, setExpanded] = useState(true)

  if (!projects) return null

  const visibleProjects = Object.entries(projects)
    .filter(([, p]) => !HIDDEN_STATUSES.includes(p.status))
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a[1].priority] ?? 2
      const pb = PRIORITY_ORDER[b[1].priority] ?? 2
      if (pa !== pb) return pa - pb
      // Within same priority, stalled last
      const as = STALLED_STATUSES.includes(a[1].status) ? 1 : 0
      const bs = STALLED_STATUSES.includes(b[1].status) ? 1 : 0
      return as - bs
    })

  if (visibleProjects.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{ ...SECTION_HEADER, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ flex: 1 }}>🚀 Project Pulse</span>
        <span style={{
          marginRight: 20, fontSize: 14, color: colors.textDim,
          transition: 'transform 0.15s', display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>›</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 20px' }}>
          {visibleProjects.map(([slug, project]) => (
            <ProjectCard
              key={slug}
              slug={slug}
              project={project}
              onDone={onDone}
              onLog={onLog}
            />
          ))}
        </div>
      )}
    </div>
  )
}
