import { colors, fonts } from '../theme'

const bulletConfig = {
  info: { icon: '→', color: colors.bullet.info },
  warn: { icon: '⚠', color: colors.bullet.warn },
  tip: { icon: '💡', color: colors.bullet.tip },
  default: { icon: '·', color: colors.bullet.default },
}

export default function Bullet({ type = 'default', text }) {
  const config = bulletConfig[type] || bulletConfig.default
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 4,
      fontSize: 12,
      lineHeight: 1.5,
      color: colors.textMuted,
    }}>
      <span style={{
        color: config.color,
        flexShrink: 0,
        fontSize: type === 'tip' ? 10 : 12,
        width: 16,
        textAlign: 'center',
      }}>
        {config.icon}
      </span>
      <span dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}

export function renderBullets(items) {
  if (!items || !items.length) return null
  return items.map((item, i) => (
    <Bullet key={i} type={item.type} text={item.text} />
  ))
}
