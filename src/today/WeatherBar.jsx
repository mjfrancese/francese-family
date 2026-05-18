import { colors, fonts } from '../theme'

const WEATHER_EMOJI = {
  clear: '☀️',
  'partly-cloudy': '🌤️',
  overcast: '☁️',
  fog: '🌫️',
  rain: '🌧️',
  snow: '❄️',
  showers: '🌦️',
  thunderstorm: '⛈️',
}

function getWeatherEmoji(condition) {
  if (!condition) return '🌡️'
  const lower = condition.toLowerCase()
  for (const [key, emoji] of Object.entries(WEATHER_EMOJI)) {
    if (lower.includes(key)) return emoji
  }
  if (lower.includes('cloud')) return '🌤️'
  if (lower.includes('sun')) return '☀️'
  if (lower.includes('storm')) return '⛈️'
  return '🌡️'
}

function getDayContext(dateStr) {
  if (!dateStr) return null
  const [, m, d] = dateStr.split('-').map(Number)
  const date = new Date(`${dateStr}T12:00:00`)
  const dow = date.getDay() // 0=Sun, 3=Wed

  const notes = []
  if (dow === 3) {
    notes.push('Vestry night')
    notes.push('WoW reset')
  }
  if (m === 5 && d === 23) {
    notes.push("🎂 Kenna's Birthday!")
  }
  return notes.length > 0 ? notes.join(' · ') : null
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function WeatherBar({ weather, date }) {
  const emoji = getWeatherEmoji(weather?.condition)
  const dayContext = getDayContext(date)
  const displayDate = formatDisplayDate(date)

  return (
    <div style={{
      padding: '20px 20px 16px',
      background: 'linear-gradient(180deg, #0e1020 0%, #0d0d18 100%)',
      borderBottom: `1px solid ${colors.divider}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 26,
            fontWeight: 700,
            color: colors.text,
            letterSpacing: 0.3,
            lineHeight: 1.2,
          }}>
            {displayDate}
          </div>
          {dayContext && (
            <div style={{
              fontSize: 13,
              color: colors.accent,
              marginTop: 4,
              fontFamily: fonts.body,
            }}>
              {dayContext}
            </div>
          )}
        </div>
        {weather && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
          }}>
            <div style={{
              fontSize: 22,
              fontFamily: fonts.body,
              color: colors.text,
              fontWeight: 600,
            }}>
              {emoji} {weather.temp_f != null ? `${Math.round(weather.temp_f)}°` : ''}
            </div>
            {weather.precip_pct != null && weather.precip_pct > 20 && (
              <div style={{ fontSize: 11, color: colors.textDim }}>
                💧 {weather.precip_pct}% rain
              </div>
            )}
            {weather.wind_mph != null && weather.wind_mph > 15 && (
              <div style={{ fontSize: 11, color: colors.textDim }}>
                💨 {weather.wind_mph} mph
              </div>
            )}
          </div>
        )}
      </div>
      {weather?.advice && (
        <div style={{
          marginTop: 10,
          fontSize: 13,
          color: colors.textMuted,
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>
          {weather.advice}
        </div>
      )}
    </div>
  )
}
