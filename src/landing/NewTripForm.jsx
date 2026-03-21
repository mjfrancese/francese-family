import { useState } from 'react'
import { ref, set } from 'firebase/database'
import { db, sanitizeEmail, OWNER_EMAILS } from '../firebase'
import { colors, fonts } from '../theme'

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewTripForm({ onClose }) {
  const [title, setTitle] = useState('')
  const [dates, setDates] = useState('')
  const [emoji, setEmoji] = useState('✈')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('planning')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [color, setColor] = useState('#4a90d9')
  const [travelers, setTravelers] = useState('Michael, Meghan, Kenna, Louise')
  const [saving, setSaving] = useState(false)

  const slug = slugify(title)

  const handleSubmit = async () => {
    if (!title || !slug) return
    setSaving(true)

    try {
      const meta = {
        title,
        dates,
        emoji,
        description,
        status,
        color,
        travelers: travelers.split(',').map(t => t.trim()).filter(Boolean),
        coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
      }

      await set(ref(db, `trips/${slug}/meta`), meta)

      // Seed access for both owners
      for (const email of OWNER_EMAILS) {
        const sanitized = sanitizeEmail(email)
        const name = email.includes('mfrancese') ? 'Michael' : 'Meghan'
        await set(ref(db, `trips/${slug}/access/${sanitized}`), { role: 'owner', name })
      }

      onClose()
    } catch (err) {
      console.error('Failed to create trip:', err)
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#1a1a2a',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.body,
    outline: 'none',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{
          fontFamily: fonts.heading,
          fontSize: 20,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 20,
        }}>
          New Trip
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Trip Name</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="London & Paris" />
            {slug && <div style={{ fontSize: 10, color: colors.textDark, marginTop: 4 }}>Slug: {slug}</div>}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Emoji</label>
              <input value={emoji} onChange={e => setEmoji(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ ...inputStyle, padding: 4, height: 42 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Dates</label>
            <input value={dates} onChange={e => setDates(e.target.value)} style={inputStyle} placeholder="Jun 7-16, 2026" />
          </div>

          <div>
            <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Brief trip description..." />
          </div>

          <div>
            <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
              <option value="planning">Planning</option>
              <option value="upcoming">Upcoming</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Latitude</label>
              <input value={lat} onChange={e => setLat(e.target.value)} style={inputStyle} placeholder="33.749" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Longitude</label>
              <input value={lng} onChange={e => setLng(e.target.value)} style={inputStyle} placeholder="-84.388" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Travelers (comma-separated)</label>
            <input value={travelers} onChange={e => setTravelers(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button
            onClick={handleSubmit}
            disabled={!title || saving}
            style={{
              flex: 1,
              padding: '12px',
              background: colors.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
              opacity: !title || saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Creating...' : 'Create Trip'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.textDim,
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
