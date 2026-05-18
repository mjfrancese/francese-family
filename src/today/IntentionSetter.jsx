import { useState, useRef } from 'react'
import { colors, fonts } from '../theme'

const AMBER = '#e8c55c'
const AMBER_BORDER = 'rgba(232, 197, 92, 0.30)'

export default function IntentionSetter({ todayDate, currentIntention, viewerKey, onSet }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const hasIntention = currentIntention && currentIntention.trim().length > 0

  function startEditing() {
    setDraft(currentIntention || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function submit() {
    const text = draft.trim()
    if (text) {
      onSet(text)
    }
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  return (
    <div style={{
      margin: '16px 20px',
      background: colors.card,
      border: `1px solid ${AMBER_BORDER}`,
      borderRadius: 14,
      padding: 20,
      boxShadow: `0 0 0 1px ${AMBER_BORDER}`,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: AMBER,
        opacity: 0.8,
        marginBottom: 12,
        fontFamily: fonts.body,
      }}>
        Today's Intention
      </div>

      {editing ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={submit}
          onKeyDown={handleKeyDown}
          placeholder="What's the one thing that makes today a win?"
          rows={2}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${AMBER_BORDER}`,
            color: colors.text,
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 1.5,
            outline: 'none',
            resize: 'none',
            padding: '4px 0',
            boxSizing: 'border-box',
          }}
        />
      ) : hasIntention ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontStyle: 'italic',
            color: colors.text,
            lineHeight: 1.5,
            flex: 1,
          }}>
            {currentIntention}
          </div>
          <button
            onClick={startEditing}
            title="Edit intention"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              padding: '2px 4px',
              color: colors.textDim,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            ✏️
          </button>
        </div>
      ) : (
        <div
          onClick={startEditing}
          style={{
            fontSize: 15,
            color: colors.textDark,
            fontStyle: 'italic',
            cursor: 'text',
            fontFamily: fonts.body,
            lineHeight: 1.5,
            paddingBottom: 2,
            borderBottom: `1px solid ${AMBER_BORDER}`,
          }}
        >
          What's the one thing that makes today a win?
        </div>
      )}
    </div>
  )
}
