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

function ProjectCard({ slug, project, onDone }) {
  const { label, emoji, priority, status, next_action, done_today } = project
  const isStalled = STALLED_STATUSES.includes(status)

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      opacity: isStalled ? 0.6 : 1,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {done_today && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,58,42,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12,
          zIndex: 1,
        }}>
          <span style={{ color: colors.status.booked.color, fontWeight: 700, fontSize: 15 }}>
            ✓ Done for today
          </span>
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 8, marginBottom: 8,
      }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: colors.text, flex: 1 }}>{label}</span>
        <PriorityBadge priority={priority} />
      </div>
      {next_action && (
        <div style={{
          fontSize: 13, color: colors.textMuted,
          lineHeight: 1.5, marginBottom: done_today ? 0 : 12,
        }}>
          {next_action}
        </div>
      )}
      {!done_today && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onDone(slug)}
            style={{
              flex: 1, minHeight: 36, borderRadius: 8,
              background: colors.accent, border: 'none',
              color: '#fff', fontFamily: fonts.body, fontSize: 13,
              fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
            }}
          >
            Done for today
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProjectsSection({ projects, onDone }) {
  const [expanded, setExpanded] = useState(true)

  if (!projects) return null

  const visibleProjects = Object.entries(projects)
    .filter(([, p]) => !HIDDEN_STATUSES.includes(p.status))
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return (order[a[1].priority] ?? 2) - (order[b[1].priority] ?? 2)
    })

  if (visibleProjects.length === 0) return null

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{ ...SECTION_HEADER, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ flex: 1 }}>🔁 Projects</span>
        <span style={{ marginRight: 20, fontSize: 14, color: colors.textDim, transition: 'transform 0.15s', display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 20px' }}>
          {visibleProjects.map(([slug, project]) => (
            <ProjectCard key={slug} slug={slug} project={project} onDone={onDone} />
          ))}
        </div>
      )}
    </div>
  )
}
