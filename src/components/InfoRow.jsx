import { colors, fonts } from '../theme'
import StatusBadge from './StatusBadge'

export default function InfoRow({ label, value, mono = false, status, statusLabel }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '6px 0',
      borderBottom: `1px solid ${colors.divider}`,
      gap: 12,
    }}>
      <span style={{
        fontSize: 11,
        color: colors.textDark,
        fontWeight: 500,
        minWidth: 80,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textAlign: 'right',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontSize: 12,
          color: colors.text,
          fontFamily: mono ? fonts.mono : fonts.body,
          letterSpacing: mono ? 0.3 : 0,
        }}>
          {value}
        </span>
        {status && <StatusBadge status={status} label={statusLabel} />}
      </div>
    </div>
  )
}
