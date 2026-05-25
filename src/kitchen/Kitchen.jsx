import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { colors, fonts } from '../theme'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 52, fontWeight: 200, color: colors.text, lineHeight: 1 }}>{time}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.textDim, letterSpacing: 1, marginTop: 4 }}>{date}</div>
    </div>
  )
}

function ActivityRow({ item }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '10px 0',
      borderBottom: `1px solid ${colors.divider}`,
    }}>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 13,
        color: colors.textDim,
        width: 56,
        flexShrink: 0,
      }}>
        {item.time}
      </div>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon || '📌'}</div>
      <div style={{ fontSize: 15, color: colors.text, fontFamily: fonts.body, fontWeight: 500 }}>
        {item.label}
        {item.person && (
          <span style={{
            marginLeft: 8,
            fontSize: 11,
            color: colors.textDim,
            fontWeight: 400,
          }}>
            {item.person}
          </span>
        )}
      </div>
    </div>
  )
}

function PersonDot({ name, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 13, color: colors.text, fontFamily: fonts.body }}>{name}</span>
    </div>
  )
}

export default function Kitchen() {
  const [kitchenData, setKitchenData] = useState(null)
  const date = todayStr()

  useEffect(() => {
    const r = ref(db, `kitchen/${date}`)
    const unsub = onValue(r, snap => {
      setKitchenData(snap.val())
    })
    return unsub
  }, [date])

  const activities = kitchenData?.activities
    ? (Array.isArray(kitchenData.activities) ? kitchenData.activities : Object.values(kitchenData.activities))
    : []

  const tomorrowItems = kitchenData?.tomorrow_preview
    ? (typeof kitchenData.tomorrow_preview === 'string'
        ? [{ label: kitchenData.tomorrow_preview }]
        : kitchenData.tomorrow_preview)
    : []

  const homeTonight = kitchenData?.home_tonight || []

  const PERSON_COLORS = {
    Michael: '#4a90d9',
    Meghan: '#a78bfa',
    Kenna: '#fbbf24',
    Louise: '#f472b6',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080810',
      fontFamily: fonts.body,
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr 0.8fr',
      gap: 0,
      padding: 0,
    }}>

      {/* Left: Clock + weather */}
      <div style={{
        padding: '36px 28px',
        borderRight: `1px solid ${colors.divider}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <Clock />

        {kitchenData?.weather_summary && (
          <div style={{
            marginTop: 'auto',
            padding: '14px 0 0',
            borderTop: `1px solid ${colors.divider}`,
          }}>
            <div style={{ fontSize: 13, color: colors.textDim, fontFamily: fonts.mono }}>Weather</div>
            <div style={{ fontSize: 22, color: colors.text, fontFamily: fonts.body, marginTop: 4 }}>
              {kitchenData.weather_summary}
            </div>
          </div>
        )}
      </div>

      {/* Center: Today's schedule */}
      <div style={{ padding: '36px 28px' }}>
        <div style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: 3,
          color: colors.textDim,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Today
        </div>

        {activities.length > 0 ? (
          activities.map((item, i) => <ActivityRow key={i} item={item} />)
        ) : (
          <div style={{ color: colors.textDark, fontSize: 14, paddingTop: 20 }}>
            No activities scheduled
          </div>
        )}

        {kitchenData?.dinner && (
          <div style={{
            marginTop: 20,
            padding: '12px 14px',
            background: '#1a1a2a',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🍽️</span>
            <div>
              <div style={{ fontSize: 10, color: colors.textDim, fontFamily: fonts.mono, letterSpacing: 1, textTransform: 'uppercase' }}>Dinner</div>
              <div style={{ fontSize: 15, color: colors.text, fontFamily: fonts.body, fontWeight: 500 }}>{kitchenData.dinner}</div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Who's home + tomorrow */}
      <div style={{
        padding: '36px 24px',
        borderLeft: `1px solid ${colors.divider}`,
      }}>
        {homeTonight.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: 3,
              color: colors.textDim,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Home Tonight
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {homeTonight.map(name => (
                <PersonDot key={name} name={name} color={PERSON_COLORS[name] || '#8a8aaa'} />
              ))}
            </div>
          </div>
        )}

        {tomorrowItems.length > 0 && (
          <div>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: 3,
              color: colors.textDim,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Tomorrow
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tomorrowItems.map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, lineHeight: 1.5 }}>
                  {typeof item === 'string' ? item : item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {kitchenData === null && (
          <div style={{ fontSize: 13, color: colors.textDark, fontFamily: fonts.body }}>
            No data yet for today.<br />
            <span style={{ fontSize: 11, color: '#2a2a3a' }}>Admin can add kitchen data for this date.</span>
          </div>
        )}
      </div>
    </div>
  )
}
