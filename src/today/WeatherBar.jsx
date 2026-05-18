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
  const dow = date.getDay()

  const notes = []
  if (dow === 3) {
    notes.push('Vestry night')
    notes.push('WoW reset')
  }
  if (m === 5 && d === 23) notes.push("🎂 Kenna's Birthday!")
  if (m === 10 && d === 20) notes.push("🎂 Louise's Birthday!")
  return notes.length > 0 ? notes.join(' · ') : null
}

function isBirthday(dateStr) {
  if (!dateStr) return null
  const [, m, d] = dateStr.split('-').map(Number)
  if (m === 5 && d === 23) return "🎂 Happy Birthday, Kenna!"
  if (m === 10 && d === 20) return "🎂 Happy Birthday, Louise!"
  return null
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getFirstTimedEvent(calendar) {
  if (!calendar || !Array.isArray(calendar)) return null
  return calendar.find(e => !e.all_day && e.time_str) || null
}

function getLeftBorderStyle(precip) {
  if (precip > 80) return '3px solid #e85c5c'
  if (precip > 60) return '3px solid #e8c55c'
  return 'none'
}

export default function WeatherBar({ weather, todayDate, viewerKey, michaelCalendar, meghanCalendar }) {
  const emoji = getWeatherEmoji(weather?.condition)
  const dayContext = getDayContext(todayDate)
  const displayDate = formatDisplayDate(todayDate)
  const birthdayBanner = isBirthday(todayDate)
  const precip = weather?.precip_pct ?? 0
  const leftBorder = getLeftBorderStyle(precip)

  // Next event previews -- use pre-filtered per-user calendars
  const michaelNext = getFirstTimedEvent(michaelCalendar)
  const meghanNext = getFirstTimedEvent(meghanCalendar)

  const parentPreviews = []
  if (michaelNext) parentPreviews.push(`Michael: ${michaelNext.summary}${michaelNext.time_str ? ' ' + michaelNext.time_str : ''}`)
  if (meghanNext) parentPreviews.push(`Meghan: ${meghanNext.summary}${meghanNext.time_str ? ' ' + meghanNext.time_str : ''}`)

  return (
    <div style={{
      padding: '20px 20px 16px',
      background: 'linear-gradient(180deg, #0e1020 0%, #0d0d18 100%)',
      borderBottom: `1px solid ${colors.divider}`,
      borderLeft: leftBorder,
    }}>
      {birthdayBanner && (
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#e8c55c',
          marginBottom: 10,
          textAlign: 'center',
          fontFamily: fonts.heading,
        }}>
          {birthdayBanner}
        </div>
      )}

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
              <div style={{ fontSize: 11, color: precip > 60 ? '#e8c55c' : colors.textDim }}>
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

      {parentPreviews.length > 0 && (
        <div style={{
          marginTop: 10,
          fontSize: 12,
          color: colors.textDim,
          lineHeight: 1.6,
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: 8,
        }}>
          {parentPreviews.join(' · ')}
        </div>
      )}
    </div>
  )
}
