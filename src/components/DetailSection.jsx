import { fonts } from '../theme'

export default function DetailSection({ icon, title, color = '#8a8aaa', children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span style={{
          fontFamily: fonts.heading,
          fontSize: 13,
          fontWeight: 600,
          color,
          letterSpacing: 0.3,
        }}>
          {title}
        </span>
      </div>
      <div style={{ paddingLeft: 22 }}>
        {children}
      </div>
    </div>
  )
}
