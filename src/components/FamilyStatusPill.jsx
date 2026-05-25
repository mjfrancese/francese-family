import { colors, fonts } from '../theme'

const STATUS_CONFIG = {
  'on-track':        { color: '#5ce892', bg: '#1a3a2a', border: '#2d6b45', label: 'On Track',        dot: '●' },
  'needs-attention': { color: '#e8c55c', bg: '#3a2e1a', border: '#6b5a2d', label: 'Needs Attention', dot: '●' },
  'action-required': { color: '#e85c5c', bg: '#3a1a1a', border: '#6b2d2d', label: 'Action Required', dot: '●' },
}

export default function FamilyStatusPill({ overall, message, areas, compact = false }) {
  const cfg = STATUS_CONFIG[overall] || STATUS_CONFIG['needs-attention']

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 20,
        fontSize: 12,
        color: cfg.color,
        fontFamily: fonts.body,
        cursor: 'default',
      }}>
        <span style={{ fontSize: 8 }}>{cfg.dot}</span>
        {cfg.label}
      </div>
    )
  }

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: '14px 18px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: message || areas ? 10 : 0 }}>
        <span style={{ fontSize: 10, color: cfg.color }}>●</span>
        <span style={{
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 14,
          color: cfg.color,
        }}>
          Family Status: {cfg.label}
        </span>
      </div>

      {message && (
        <p style={{ fontSize: 13, color: colors.textMuted, margin: '0 0 10px', fontFamily: fonts.body, lineHeight: 1.5 }}>
          {message}
        </p>
      )}

      {areas && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(areas).map(([key, area]) => {
            const ac = STATUS_CONFIG[area.status] || STATUS_CONFIG['needs-attention']
            return (
              <div key={key} style={{
                padding: '3px 10px',
                background: '#0d0d18',
                border: `1px solid ${ac.border}`,
                borderRadius: 12,
                fontSize: 11,
                color: ac.color,
                fontFamily: fonts.body,
                title: area.message,
              }} title={area.message}>
                {area.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
