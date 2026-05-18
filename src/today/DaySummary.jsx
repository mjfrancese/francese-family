import { colors, fonts } from '../theme'

export default function DaySummary({ summary }) {
  if (!summary) return null

  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: `1px solid ${colors.divider}`,
    }}>
      <p style={{
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        fontStyle: 'italic',
        lineHeight: 1.6,
        margin: 0,
      }}>
        {summary}
      </p>
    </div>
  )
}
