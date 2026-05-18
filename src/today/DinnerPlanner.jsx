import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
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

const COOK_OPTIONS = ['Meghan', 'Michael', 'Together', 'Out']

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
}

function getISOWeekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dayOfWeek = d.getDay() || 7
  d.setDate(d.getDate() + 4 - dayOfWeek)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getFullYear()}-${String(weekNum).padStart(2, '0')}`
}

function getDayKey(dateStr) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  return days[new Date(dateStr + 'T12:00:00').getDay()]
}

function getWeekDates(todayStr) {
  const today = new Date(todayStr + 'T12:00:00')
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow + 6) % 7))
  return DAYS_ORDER.map((key, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    return { dateStr, dayKey: key, label: DAY_LABELS[key], isToday: dateStr === todayStr }
  })
}

const DB_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL
const DB_SECRET = import.meta.env.VITE_FIREBASE_DATABASE_SECRET

async function firebaseRestPut(path, value) {
  const url = `${DB_URL}/${path}.json?auth=${DB_SECRET}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Firebase PUT failed: ${res.status} ${text}`)
  }
  return res.json()
}

function DinnerRow({ dayKey, label, mealData, weekKey, isToday, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [meal, setMeal] = useState('')
  const [cook, setCook] = useState('Meghan')
  const [note, setNote] = useState('')

  const display = mealData || {}
  const hasMeal = display.meal && display.meal.trim()

  function startEdit() {
    setMeal(display.meal || '')
    setCook(display.cook || 'Meghan')
    setNote(display.note || '')
    setEditing(true)
  }

  async function save() {
    const value = { meal: meal.trim(), cook, note: note.trim() }
    setEditing(false)
    onUpdate(weekKey, dayKey, value)
  }

  if (editing) {
    return (
      <div style={{ padding: '10px 0' }}>
        <div style={{ fontSize: 11, color: isToday ? colors.accent : colors.textDim, fontWeight: 600, marginBottom: 6 }}>
          {label}
        </div>
        <input
          autoFocus
          value={meal}
          onChange={e => setMeal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          placeholder="What's for dinner?"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1a1a28', border: `1px solid ${colors.accent}`,
            borderRadius: 8, color: colors.text, fontFamily: fonts.body,
            fontSize: 14, padding: '8px 10px', marginBottom: 8, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {COOK_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setCook(opt)} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              fontFamily: fonts.body, fontWeight: 600,
              background: cook === opt ? colors.accent : '#1a1a28',
              border: `1px solid ${cook === opt ? colors.accent : colors.cardBorder}`,
              color: cook === opt ? '#fff' : colors.textMuted,
            }}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} style={{
            flex: 1, minHeight: 36, borderRadius: 8, background: colors.accent,
            border: 'none', color: '#fff', fontFamily: fonts.body, fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>Save</button>
          <button onClick={() => setEditing(false)} style={{
            padding: '0 16px', minHeight: 36, borderRadius: 8,
            background: 'transparent', border: `1px solid ${colors.cardBorder}`,
            color: colors.textDim, fontFamily: fonts.body, fontSize: 13, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: isToday ? colors.accent : colors.textDim, fontWeight: 600, marginBottom: 2 }}>
          {label}
        </div>
        {hasMeal ? (
          <div style={{ fontSize: 14, color: colors.text }}>
            {display.meal}
            {display.cook && (
              <span style={{ fontSize: 11, color: colors.textDim, marginLeft: 6 }}>· {display.cook}</span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: colors.textDark, fontStyle: 'italic' }}>No plan yet</div>
        )}
      </div>
      <button onClick={startEdit} style={{
        padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
        background: 'transparent', border: `1px solid ${colors.cardBorder}`,
        color: colors.textDim, fontFamily: fonts.body, flexShrink: 0,
      }}>
        {hasMeal ? '✏️' : '+ plan'}
      </button>
    </div>
  )
}

export default function DinnerPlanner({ todayDate }) {
  const weekKey = todayDate ? getISOWeekKey(todayDate) : null
  const [weekData, setWeekData] = useState({})

  // Listen directly to /dinners/{weekKey} -- same path as writes
  useEffect(() => {
    if (!weekKey) return
    const r = ref(db, `dinners/${weekKey}`)
    const unsub = onValue(r, snap => {
      setWeekData(snap.val() || {})
    })
    return () => unsub()
  }, [weekKey])

  if (!todayDate || !weekKey) return null

  const weekDays = getWeekDates(todayDate)

  async function handleUpdate(wk, dayKey, value) {
    // Optimistic update
    setWeekData(prev => ({ ...prev, [dayKey]: value }))
    try {
      await firebaseRestPut(`dinners/${wk}/${dayKey}`, value)
    } catch (e) {
      console.error('Dinner update failed:', e)
      // Revert on failure
      setWeekData(prev => ({ ...prev, [dayKey]: weekData[dayKey] }))
    }
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>🍽️ Dinners This Week</div>
      <div style={{
        margin: '0 20px',
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 14,
        padding: '4px 16px',
      }}>
        {weekDays.map(({ dayKey, label, isToday }, i) => (
          <div key={dayKey}>
            {i > 0 && <div style={{ height: 1, background: colors.divider }} />}
            <DinnerRow
              dayKey={dayKey}
              label={label + (isToday ? ' · today' : '')}
              mealData={weekData[dayKey] || null}
              weekKey={weekKey}
              isToday={isToday}
              onUpdate={handleUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
