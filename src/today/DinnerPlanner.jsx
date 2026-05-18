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

const COOK_OPTIONS = ['Michael', 'Meghan', 'Together', 'Out']

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

function DinnerRow({ label, mealData, weekKey, dayKey, onUpdate, isToday }) {
  const [editing, setEditing] = useState(false)
  const [meal, setMeal] = useState(mealData?.meal || '')
  const [cook, setCook] = useState(mealData?.cook || 'Michael')
  const [note, setNote] = useState(mealData?.note || '')
  const [optimistic, setOptimistic] = useState(null)

  const display = optimistic || mealData

  function startEdit() {
    setMeal(mealData?.meal || '')
    setCook(mealData?.cook || 'Michael')
    setNote(mealData?.note || '')
    setEditing(true)
  }

  function save() {
    const value = { meal: meal.trim(), cook, note: note.trim() }
    setOptimistic(value)
    setEditing(false)
    if (onUpdate && weekKey && dayKey) {
      onUpdate(weekKey, dayKey, value)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  const hasMeal = display?.meal && display.meal.trim()

  if (editing) {
    return (
      <div style={{ padding: '10px 0' }}>
        <div style={{
          fontSize: 11,
          color: colors.textDim,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 6,
          fontFamily: fonts.body,
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            autoFocus
            value={meal}
            onChange={e => setMeal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's for dinner?"
            style={{
              background: '#0d0d18',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 8,
              color: colors.text,
              fontFamily: fonts.body,
              fontSize: 14,
              padding: '8px 10px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {COOK_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setCook(opt)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${cook === opt ? colors.accent : colors.cardBorder}`,
                  background: cook === opt ? 'rgba(74,144,217,0.15)' : 'transparent',
                  color: cook === opt ? colors.accent : colors.textDim,
                  fontFamily: fonts.body,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Note (optional)"
            style={{
              background: '#0d0d18',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 8,
              color: colors.textMuted,
              fontFamily: fonts.body,
              fontSize: 12,
              padding: '6px 10px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={save}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                background: colors.accent,
                border: 'none',
                color: '#fff',
                fontFamily: fonts.body,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${colors.cardBorder}`,
                color: colors.textDim,
                fontFamily: fonts.body,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
    }}>
      <div style={{
        fontSize: 11,
        color: colors.textDim,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily: fonts.body,
        width: 68,
        flexShrink: 0,
      }}>
        {label}
      </div>
      <div style={{ flex: 1 }}>
        {hasMeal ? (
          <div>
            <span style={{ fontSize: 14, color: colors.text }}>{display.meal}</span>
            {display.cook && (
              <span style={{ fontSize: 12, color: colors.textDim, marginLeft: 8 }}>
                · {display.cook}
              </span>
            )}
            {display.note && (
              <div style={{ fontSize: 11, color: colors.textDim, fontStyle: 'italic', marginTop: 2 }}>
                {display.note}
              </div>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 13, color: colors.textDim, fontStyle: 'italic' }}>
            —
          </span>
        )}
      </div>
      <button
        onClick={startEdit}
        style={{
          background: 'none',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 6,
          color: colors.textDim,
          fontSize: 12,
          padding: '4px 8px',
          cursor: 'pointer',
          flexShrink: 0,
          fontFamily: fonts.body,
        }}
      >
        {hasMeal ? '✏️' : '+ plan'}
      </button>
    </div>
  )
}

export default function DinnerPlanner({ dinnerData, todayDate, onDinnerUpdate }) {
  if (!todayDate) return null

  const todayWeekKey = dinnerData?.week_key || getISOWeekKey(todayDate)
  const todayDayKey = getDayKey(todayDate)

  // Tomorrow's date
  const tomorrowDate = (() => {
    const d = new Date(todayDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })()
  const tomorrowWeekKey = getISOWeekKey(tomorrowDate)
  const tomorrowDayKey = getDayKey(tomorrowDate)

  const todayMeal = dinnerData?.today || null
  const tomorrowMeal = dinnerData?.tomorrow || null

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={SECTION_HEADER}>🍽️ Dinner</div>
      <div style={{
        margin: '0 20px',
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 14,
        padding: '4px 16px',
      }}>
        <DinnerRow
          label="Tonight"
          mealData={todayMeal}
          weekKey={todayWeekKey}
          dayKey={todayDayKey}
          onUpdate={onDinnerUpdate}
          isToday={true}
        />
        <div style={{ height: 1, background: colors.divider }} />
        <DinnerRow
          label="Tomorrow"
          mealData={tomorrowMeal}
          weekKey={tomorrowWeekKey}
          dayKey={tomorrowDayKey}
          onUpdate={onDinnerUpdate}
          isToday={false}
        />
      </div>
    </div>
  )
}
