import { colors, fonts } from '../theme'

export default function LiturgicalBanner({ liturgicalSeason }) {
  if (!liturgicalSeason) return null

  const { name, week, color, emoji, feast_today } = liturgicalSeason

  const borderColor = color || '#c8a84b'

  return (
    <div style={{
      borderLeft: `3px solid ${borderColor}`,
      background: '#0e0e1a',
      padding: '8px 16px 8px 14px',
      fontSize: 12,
      fontFamily: fonts.body,
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <div style={{ color: colors.textMuted, lineHeight: 1.4 }}>
        <span style={{ color: borderColor, marginRight: 6 }}>{emoji}</span>
        <span>{name}</span>
        {week != null && (
          <span style={{ color: colors.textDim }}> · Week {week}</span>
        )}
      </div>
      {feast_today && (
        <div style={{ color: borderColor, fontSize: 11.5, fontWeight: 600 }}>
          ★ Today: {feast_today}
        </div>
      )}
    </div>
  )
}
