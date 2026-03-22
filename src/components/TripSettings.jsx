import { useState } from 'react'
import { ref, update } from 'firebase/database'
import { db } from '../firebase'
import { colors, fonts } from '../theme'
import { X, Plus, Trash2 } from 'lucide-react'
import TripIcon from './TripIcon'
import { availableIcons, getIconComponent } from './TripIcon'

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'complete', label: 'Complete' },
]

const colorOptions = [
  '#3b82f6', '#ef4444', '#e8c55c', '#5ce892', '#b88ad9',
  '#f97316', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6',
]

export default function TripSettings({ slug, meta, onClose }) {
  const [title, setTitle] = useState(meta.title || '')
  const [dates, setDates] = useState(meta.dates || '')
  const [description, setDescription] = useState(meta.description || '')
  const [status, setStatus] = useState(meta.status || 'planning')
  const [icon, setIcon] = useState(meta.icon || '')
  const [color, setColor] = useState(meta.color || '#3b82f6')
  const [travelers, setTravelers] = useState(meta.travelers || [])
  const [newTraveler, setNewTraveler] = useState('')
  const [saving, setSaving] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)

  const addTraveler = () => {
    const name = newTraveler.trim()
    if (name && !travelers.includes(name)) {
      setTravelers([...travelers, name])
      setNewTraveler('')
    }
  }

  const removeTraveler = (name) => {
    setTravelers(travelers.filter(t => t !== name))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const metaRef = ref(db, `trips/${slug}/meta`)
      await update(metaRef, {
        title,
        dates,
        description,
        status,
        icon,
        color,
        travelers,
      })
      onClose()
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#1a1a2e',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.body,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontFamily: fonts.mono,
    letterSpacing: 1,
    color: colors.textDim,
    textTransform: 'uppercase',
    marginBottom: 6,
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 12,
        width: '100%',
        maxWidth: 520,
        maxHeight: '90vh',
        overflow: 'auto',
        padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 600, color: colors.text }}>
            Trip Settings
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textDim, cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Icon + Color row */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <div>
            <span style={labelStyle}>Icon</span>
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              style={{
                background: '#1a1a2e',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <TripIcon icon={icon} size={32} tripColor={color} />
              <span style={{ fontSize: 11, color: colors.textMuted }}>{icon || 'Choose'}</span>
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <span style={labelStyle}>Color</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {colorOptions.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Icon picker grid */}
        {showIconPicker && (
          <div style={{
            background: '#1a1a2e',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
            gap: 4,
          }}>
            {availableIcons.map(name => {
              const Icon = getIconComponent(name)
              return (
                <button
                  key={name}
                  onClick={() => { setIcon(name); setShowIconPicker(false) }}
                  title={name}
                  style={{
                    background: icon === name ? `${color}22` : 'transparent',
                    border: icon === name ? `1px solid ${color}44` : '1px solid transparent',
                    borderRadius: 6,
                    padding: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.1s ease',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = `${color}11`}
                  onMouseOut={e => e.currentTarget.style.background = icon === name ? `${color}22` : 'transparent'}
                >
                  <Icon size={20} color={icon === name ? color : colors.textMuted} />
                  <span style={{ fontSize: 8, color: colors.textDark, textTransform: 'capitalize' }}>{name}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Trip Name</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="e.g. London & Paris 2026"
          />
        </div>

        {/* Dates */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Dates</label>
          <input
            value={dates}
            onChange={e => setDates(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Jun 7–16, 2026"
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Brief trip description..."
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Status</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: status === opt.value ? `${color}22` : '#1a1a2e',
                  border: `1px solid ${status === opt.value ? color : colors.border}`,
                  borderRadius: 6,
                  color: status === opt.value ? color : colors.textMuted,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Travelers */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Travelers</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {travelers.map(t => (
              <span key={t} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: '#1a1a2e',
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                fontSize: 12,
                color: colors.text,
              }}>
                {t}
                <button
                  onClick={() => removeTraveler(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textDark,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newTraveler}
              onChange={e => setNewTraveler(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTraveler() } }}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Add traveler name..."
            />
            <button
              onClick={addTraveler}
              disabled={!newTraveler.trim()}
              style={{
                padding: '8px 14px',
                background: newTraveler.trim() ? color : '#1a1a2e',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                cursor: newTraveler.trim() ? 'pointer' : 'default',
                opacity: newTraveler.trim() ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.textMuted,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              padding: '10px 24px',
              background: color,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: fonts.body,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
