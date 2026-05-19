// ProjectPulse.jsx - /today: focus cards + waiting strip
// active_focus = full card | waiting = compact blocker row | active/dormant = hidden (see /projects)

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { colors, fonts } from '../theme'

const HIDDEN_STATUSES = ['done', 'hiatus']
const MODE_HIDDEN_ON_TODAY = new Set(['dormant', 'active'])

function FocusCard({ slug, project, onDone, onLog }) {
  const { label, emoji, next_action, last_log, days_since_update, done_today } = project
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [optimisticLog, setOptimisticLog] = useState(null)

  const displayLog = optimisticLog || last_log
  const truncated = displayLog && displayLog.length > 80
    ? displayLog.slice(0, 80) + '…'
    : displayLog

  function handleNoteSubmit() {
    if (noteText.trim()) {
      setOptimisticLog(noteText.trim())
      onLog(slug, noteText.trim())
    }
    setShowNote(false)
    setNoteText('')
  }

  return (
    <div style={{
      background: colors.card,
      border: `1px solid #1a3a5e`,
      borderLeft: '3px solid #4a9eff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {done_today && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,58,42,0.80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, zIndex: 1,
        }}>
          <span style={{ color: '#7ec8a0', fontWeight: 700, fontSize: 15 }}>
            ✓ Done for today
          </span>
        </div>
      )}

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: colors.text, flex: 1 }}>{label}</span>
        {days_since_update != null && days_since_update > 0 && (
          <span style={{
            fontSize: 11,
            color: days_since_update > 21 ? '#e85c5c' : days_since_update > 10 ? '#e8c55c' : colors.textDark,
          }}>
            {days_since_update}d
          </span>
        )}
      </div>

      {/* Next action */}
      {next_action && (
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#4a9eff', marginBottom: 4,
          }}>Next</div>
          <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
            {next_action}
          </div>
        </div>
      )}

      {/* Latest log */}
      {truncated && (
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: colors.textDim, marginBottom: 4,
          }}>Latest</div>
          <div style={{ fontSize: 12, color: colors.textDim, fontStyle: 'italic', lineHeight: 1.5 }}>
            {truncated}
          </div>
        </div>
      )}

      {/* Note input */}
      {showNote && (
        <textarea
          autoFocus
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onBlur={handleNoteSubmit}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNoteSubmit() }
            if (e.key === 'Escape') { setShowNote(false); setNoteText('') }
          }}
          placeholder="Quick note… (Enter to save)"
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#0d0d18', border: `1px solid ${colors.cardBorder}`,
            borderRadius: 8, color: colors.text, fontFamily: fonts.body,
            fontSize: 13, padding: '8px 10px', outline: 'none', resize: 'none',
            marginBottom: 10,
          }}
        />
      )}

      {/* Buttons */}
      {!done_today && (
        <div style={{ display: 'flex', gap: 8 }}>
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
          <button
            onClick={() => { setShowNote(v => !v); setNoteText('') }}
            style={{
              padding: '0 14px', minHeight: 36, borderRadius: 8,
              background: '#1a1a28', border: `1px solid ${colors.cardBorder}`,
              color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, cursor: 'pointer',
            }}
          >
            📝 Note
          </button>
        </div>
      )}
    </div>
  )
}

function WaitingRow({ project }) {
  const { label, emoji, waiting_on } = project
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '10px 0',
      borderBottom: `1px solid ${colors.cardBorder}`,
    }}>
      <span style={{ fontSize: 16, lineHeight: '20px' }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted }}>{label}</div>
        {waiting_on && (
          <div style={{ fontSize: 12, color: '#a08030', marginTop: 2, lineHeight: 1.4 }}>
            ⏳ {waiting_on}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectPulse({ projects, onDone, onLog }) {
  const [expanded, setExpanded] = useState(true)

  if (!projects) return null

  const all = Object.entries(projects).filter(([, p]) => !HIDDEN_STATUSES.includes(p?.status))

  const focusItems = all.filter(([, p]) => (p?.mode || 'active') === 'active_focus')
  const waitingItems = all.filter(([, p]) => (p?.mode || 'active') === 'waiting')
  const otherCount = all.filter(([, p]) => MODE_HIDDEN_ON_TODAY.has(p?.mode || 'active')).length

  if (focusItems.length === 0 && waitingItems.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: colors.textDim, fontFamily: fonts.body, fontWeight: 600,
          padding: '20px 20px 8px',
          display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ flex: 1 }}>🎯 Focus</span>
        <span style={{
          marginRight: 20, fontSize: 14, color: colors.textDim,
          transition: 'transform 0.15s', display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>›</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px' }}>
          {/* Focus cards */}
          {focusItems.map(([slug, project]) => (
            <FocusCard
              key={slug} slug={slug} project={project}
              onDone={onDone} onLog={onLog}
            />
          ))}

          {/* Waiting strip */}
          {waitingItems.length > 0 && (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 12,
              padding: '0 16px',
              marginBottom: 10,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: '#e8c55c',
                padding: '12px 0 4px',
              }}>
                Waiting on someone
              </div>
              {waitingItems.map(([slug, project]) => (
                <WaitingRow key={slug} slug={slug} project={project} />
              ))}
            </div>
          )}

          {/* Link to /projects */}
          <Link to="/projects" style={{
            display: 'block', textAlign: 'center',
            padding: '10px', fontSize: 12,
            color: colors.textDim, textDecoration: 'none',
            marginBottom: 4,
          }}>
            {otherCount > 0 ? `+ ${otherCount} more · ` : ''}Weekly review →
          </Link>
        </div>
      )}
    </div>
  )
}
