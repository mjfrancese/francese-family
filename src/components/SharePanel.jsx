import { useState } from 'react'
import { colors, fonts } from '../theme'

export default function SharePanel({ accessList, onAdd, onRemove, onClose }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('viewer')

  const handleAdd = () => {
    if (!email || !name) return
    onAdd(email.trim(), name.trim(), role)
    setEmail('')
    setName('')
    setRole('viewer')
  }

  return (
    <div style={{
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
          maxWidth: 420,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{
          fontFamily: fonts.heading,
          fontSize: 18,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 16,
        }}>
          Manage Access
        </h3>

        {/* Current access list */}
        <div style={{ marginBottom: 20 }}>
          {accessList.map((a) => (
            <div key={a.email} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${colors.divider}`,
            }}>
              <div>
                <div style={{ fontSize: 13, color: colors.text }}>{a.name}</div>
                <div style={{ fontSize: 11, color: colors.textDim }}>{a.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  color: a.role === 'owner' ? '#5ce892' : colors.textDim,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  {a.role}
                </span>
                {a.role !== 'owner' && onRemove && (
                  <button
                    onClick={() => onRemove(a.email)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e85c5c',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '2px 6px',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new person */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            placeholder="Gmail address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: '10px 12px',
              background: '#1a1a2a',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.text,
              fontSize: 13,
              fontFamily: fonts.body,
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Display name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              padding: '10px 12px',
              background: '#1a1a2a',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              color: colors.text,
              fontSize: 13,
              fontFamily: fonts.body,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#1a1a2a',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                fontFamily: fonts.body,
              }}
            >
              <option value="viewer">Viewer</option>
              <option value="owner">Owner</option>
            </select>
            <button
              onClick={handleAdd}
              style={{
                padding: '10px 20px',
                background: colors.accent,
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px',
            background: 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            color: colors.textDim,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
