import { colors, fonts } from '../theme'

export default function SectionHeader({ icon, Icon, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 0 10px',
      borderBottom: `1px solid ${colors.divider}`,
      marginBottom: 14,
    }}>
      {Icon && <Icon size={16} color={colors.textMuted} />}
      {!Icon && icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      <span style={{
        fontFamily: fonts.heading,
        fontSize: 16,
        fontWeight: 600,
        color: colors.text,
        letterSpacing: 0.5,
      }}>
        {children}
      </span>
    </div>
  )
}
