import { colors, fonts } from '../theme'

const statusConfig = {
  booked: { bg: '#1a3a2a', border: '#2d6b45', color: '#5ce892', icon: '✓', label: 'BOOKED' },
  confirmed: { bg: '#1a3a2a', border: '#2d6b45', color: '#5ce892', icon: '✓', label: 'CONFIRMED' },
  pending: { bg: '#3a2e1a', border: '#6b5a2d', color: '#e8c55c', icon: '⏳', label: 'PENDING' },
  missing: { bg: '#3a1a1a', border: '#6b2d2d', color: '#e85c5c', icon: '!', label: 'MISSING' },
  action: { bg: '#3a2e1a', border: '#6b5a2d', color: '#e8c55c', icon: '⚑', label: 'ACTION' },
  upcoming: { bg: '#1a2a3a', border: '#2d456b', color: '#4a90d9', icon: '→', label: 'UPCOMING' },
  planning: { bg: '#2a1a3a', border: '#4a2d6b', color: '#b88ad9', icon: '✎', label: 'PLANNING' },
  complete: { bg: '#1a3a2a', border: '#2d6b45', color: '#5ce892', icon: '✓', label: 'COMPLETE' },
}

export default function StatusBadge({ status, label }) {
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 4,
      fontSize: 9,
      fontFamily: fonts.mono,
      fontWeight: 600,
      letterSpacing: 1,
      color: config.color,
      whiteSpace: 'nowrap',
    }}>
      <span>{config.icon}</span>
      <span>{label || config.label}</span>
    </span>
  )
}
