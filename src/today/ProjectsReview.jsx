// ProjectsReview.jsx - /projects weekly review page
// Full view: all projects grouped by mode. Mode changes persist to Firebase for the day;
// permanent changes are made by texting Hermes: "mode [slug] [active_focus|active|waiting|dormant]"

import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'
import { colors, fonts } from '../theme'

function getTodayDate() {
  const now = new Date()
  const str = now.toLocaleString('en-US', { timeZone: 'America/Chicago' })
  const d = new Date(str)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MODE_CONFIG = {
  active_focus: { label: 'In Focus', icon: '🎯', color: '#4a9eff', bg: '#0a1a2e', border: '#1a3a5e' },
  active:       { label: 'Active',   icon: '▶',  color: '#7ec8a0', bg: '#0a1e14', border: '#1a3a28' },
  waiting:      { label: 'Waiting',  icon: '⏳',  color: '#e8c55c', bg: '#1e1a0a', border: '#3a3010' },
  dormant:      { label: 'Dormant',  icon: '😴',  color: '#555575', bg: '#111120', border: '#222240' },
}

const PRIORITY_BADGE = {
  high:   { bg: '#3a1a1a', color: '#e85c5c', border: '#6b2d2d', label: 'HIGH' },
  medium: { bg: '#3a2e1a', color: '#e8c55c', border: '#6b5a2d', label: 'MED' },
  low:    { bg: '#1a1a2a', color: '#555575', border: '#2a2a3a', label: 'LOW' },
}

const NEXT_MODES = {
  active_focus: ['active', 'waiting', 'dormant'],
  active:       ['active_focus', 'waiting', 'dormant'],
  waiting:      ['active_focus', 'active', 'dormant'],
  dormant:      ['active_focus', 'active'],
}

function ModeBadge({ mode }) {
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.active
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 4, padding: '2px 6px',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const s = PRIORITY_BADGE[priority] || PRIORITY_BADGE.low
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '2px 6px',
    }}>
      {s.label}
    </span>
  )
}

function ProjectCard({ slug, project, todayDate, onModeChange, onLog }) {
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [localMode, setLocalMode] = useState(null)
  const [optimisticLog, setOptimisticLog] = useState(null)

  const { label, emoji, priority, next_action, last_log, days_since_update, waiting_on, done_today } = project
  const mode = localMode || project.mode || 'active'
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.active

  const displayLog = optimisticLog || last_log
  const truncated = displayLog && displayLog.length > 120
    ? displayLog.slice(0, 120) + '…'
    : displayLog

  async function changeMode(newMode) {
    setLocalMode(newMode)
    onModeChange(slug, newMode)
    try {
      await set(ref(db, `today/${todayDate}/projects/${slug}/mode`), newMode)
    } catch (e) {
      console.error('Mode change failed:', e)
    }
  }

  async function submitNote() {
    if (!noteText.trim()) { setShowNote(false); return }
    setOptimisticLog(noteText.trim())
    onLog(slug, noteText.trim())
    try {
      await set(ref(db, `today/${todayDate}/projects/${slug}/todays_note`), noteText.trim())
    } catch (e) {
      console.error('Note submit failed:', e)
    }
    setShowNote(false)
    setNoteText('')
  }

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${cfg.border}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      opacity: mode === 'dormant' ? 0.65 : 1,
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.text, flex: 1 }}>{label}</span>
        <PriorityBadge priority={priority} />
        <ModeBadge mode={mode} />
        {days_since_update != null && (
          <span style={{
            fontSize: 11,
            color: days_since_update > 21 ? '#e85c5c' : days_since_update > 10 ? '#e8c55c' : colors.textDark,
          }}>
            {days_since_update}d
          </span>
        )}
        {done_today && (
          <span style={{ fontSize: 11, color: '#7ec8a0' }}>✓ done today</span>
        )}
      </div>

      {/* Blocked on */}
      {waiting_on && mode === 'waiting' && (
        <div style={{
          marginBottom: 10, padding: '8px 10px',
          background: '#1e1a08', borderRadius: 8, border: '1px solid #3a3010',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#e8c55c',
          }}>Blocked on </span>
          <span style={{ fontSize: 13, color: '#c8a840' }}>{waiting_on}</span>
        </div>
      )}

      {/* Next action */}
      {next_action && (
        <div style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#4a9eff', marginBottom: 4,
          }}>Next</div>
          <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>{next_action}</div>
        </div>
      )}

      {/* Latest log */}
      {truncated && (
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: colors.textDim, marginBottom: 4,
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
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNote() }
            if (e.key === 'Escape') { setShowNote(false); setNoteText('') }
          }}
          placeholder="Log a note… (Enter to save)"
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

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setShowNote(v => !v); setNoteText('') }}
          style={BTN}
        >
          📝 Note
        </button>
        {NEXT_MODES[mode]?.map(m => {
          const c = MODE_CONFIG[m]
          return (
            <button key={m} onClick={() => changeMode(m)}
              style={{ ...BTN, color: c.color, borderColor: c.border }}
            >
              → {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const BTN = {
  padding: '6px 12px', borderRadius: 8,
  background: '#1a1a28', border: `1px solid ${colors.cardBorder}`,
  color: colors.textMuted, fontFamily: fonts.body,
  fontSize: 12, cursor: 'pointer',
}

const SECTIONS = [
  { key: 'active_focus', label: '🎯 In Focus' },
  { key: 'active',       label: '▶ Active' },
  { key: 'waiting',      label: '⏳ Waiting on someone' },
  { key: 'dormant',      label: '😴 Dormant' },
]

export default function ProjectsReview() {
  const [projects, setProjects] = useState(null)
  const [loading, setLoading] = useState(true)
  const todayDate = getTodayDate()
  const { user } = useAuth()

  const MEGHAN_EMAILS = new Set(['meghancryan@gmail.com', 'megc.holland@gmail.com', 'meghan@saint-tims.org'])
  const viewerKey = user?.email && MEGHAN_EMAILS.has(user.email) ? 'meghan' : 'michael'

  useEffect(() => {
    const r = ref(db, `today/${todayDate}/projects`)
    const unsub = onValue(r, snap => {
      setProjects(snap.val() || {})
      setLoading(false)
    }, err => {
      console.error('Projects load error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [todayDate])

  function handleModeChange(slug, newMode) {
    setProjects(prev => ({
      ...prev,
      [slug]: { ...prev?.[slug], mode: newMode },
    }))
  }

  function handleLog(slug, text) {
    setProjects(prev => ({
      ...prev,
      [slug]: { ...prev?.[slug], todays_note: text, last_log: text },
    }))
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: colors.textDim, fontSize: 13 }}>Loading…</span>
      </div>
    )
  }

  // Filter by viewer
  const viewerProjects = Object.entries(projects || {}).filter(([, p]) => {
    const who = p?.who || 'michael'
    return who === 'both' || who === viewerKey
  })

  const byMode = (mode) => viewerProjects
    .filter(([, p]) => (p?.mode || 'active') === mode)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return (order[a[1].priority] ?? 2) - (order[b[1].priority] ?? 2)
    })

  const totalProjects = viewerProjects.length
  const focusCount = byMode('active_focus').length
  const waitingCount = byMode('waiting').length

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 14px',
        borderBottom: `1px solid ${colors.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link to="/today" style={{
          color: colors.textDim, textDecoration: 'none',
          fontSize: 22, lineHeight: 1,
        }}>←</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>
            Projects
          </div>
          <div style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>
            {totalProjects} total · {focusCount} in focus · {waitingCount} waiting
          </div>
        </div>
        <div style={{ fontSize: 11, color: colors.textDark, textAlign: 'right' }}>
          Mode changes last<br />until 6:50am
        </div>
      </div>

      {/* Hint */}
      <div style={{
        padding: '10px 20px',
        fontSize: 12, color: colors.textDark,
        borderBottom: `1px solid ${colors.cardBorder}`,
        lineHeight: 1.5,
      }}>
        Permanent changes: text Hermes "mode [project] [focus|active|waiting|dormant]"
        or "log [project] [text]"
      </div>

      {/* Sections */}
      {SECTIONS.map(({ key, label }) => {
        const items = byMode(key)
        if (items.length === 0) return null
        const cfg = MODE_CONFIG[key]
        return (
          <div key={key}>
            <div style={{
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              fontWeight: 600, padding: '20px 20px 8px',
              color: cfg.color, fontFamily: fonts.body,
            }}>
              {label}
            </div>
            <div style={{ padding: '0 20px' }}>
              {items.map(([slug, project]) => (
                <ProjectCard
                  key={slug} slug={slug} project={project}
                  todayDate={todayDate}
                  onModeChange={handleModeChange}
                  onLog={handleLog}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
