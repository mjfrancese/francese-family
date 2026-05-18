import { useState } from 'react'
import { colors, fonts } from '../theme'
import { useTodayData } from './useTodayData'
import WeatherBar from './WeatherBar'
import DaySummary from './DaySummary'
import KidsSection from './KidsSection'
import CalendarSection from './CalendarSection'
import ProjectsSection from './ProjectsSection'
import LoopsSection from './LoopsSection'
import TripCountdowns from './TripCountdowns'

const DB_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL
const DB_SECRET = import.meta.env.VITE_FIREBASE_DATABASE_SECRET

async function firebaseRestPut(path, value) {
  const url = `${DB_URL}/${path}.json?auth=${DB_SECRET}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Firebase REST PUT failed: ${res.status} ${text}`)
  }
  return res.json()
}

export default function TodayDashboard() {
  const { data: rawData, loading, error, todayDate } = useTodayData()
  const [localData, setLocalData] = useState(null)

  const data = localData || rawData

  async function handleLogisticsConfirm(kid, eventId, person) {
    // Optimistic update
    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return {
        ...base,
        kids: {
          ...base.kids,
          [kid]: {
            ...base.kids?.[kid],
            logistics: {
              ...base.kids?.[kid]?.logistics,
              [eventId]: {
                ...base.kids?.[kid]?.logistics?.[eventId],
                confirmed: true,
                confirmed_person: person,
              },
            },
          },
        },
      }
    })

    const entry = rawData?.kids?.[kid]?.logistics?.[eventId] || {}
    try {
      await firebaseRestPut(`today/${todayDate}/kids/${kid}/logistics/${eventId}`, {
        ...entry,
        confirmed: true,
        confirmed_person: person,
      })
      await firebaseRestPut(`logistics/confirmations/${todayDate}/${eventId}`, {
        person,
        event_summary: entry.event_summary || '',
        time_str: entry.time_str || '',
        confirmed_at: new Date().toISOString(),
        reminder_created: false,
      })
    } catch (e) {
      console.error('Failed to confirm logistics:', e)
    }
  }

  async function handleProjectDone(slug) {
    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return {
        ...base,
        projects: {
          ...base.projects,
          [slug]: {
            ...base.projects?.[slug],
            done_today: true,
          },
        },
      }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/projects/${slug}/done_today`, true)
    } catch (e) {
      console.error('Failed to mark project done:', e)
    }
  }

  async function handleLoopDone(id) {
    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return {
        ...base,
        loops: {
          ...base.loops,
          [id]: { ...base.loops?.[id], done: true },
        },
      }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/loops/${id}/done`, true)
    } catch (e) {
      console.error('Failed to mark loop done:', e)
    }
  }

  async function handleLoopSnooze(id) {
    // Compute next monday
    const now = new Date()
    const day = now.getDay()
    const daysUntilMonday = day === 0 ? 1 : 8 - day
    const next = new Date(now)
    next.setDate(now.getDate() + daysUntilMonday)
    next.setHours(0, 0, 0, 0)
    const snoozeUntil = next.toISOString()

    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return {
        ...base,
        loops: {
          ...base.loops,
          [id]: { ...base.loops?.[id], snoozed_until: snoozeUntil },
        },
      }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/loops/${id}/snoozed_until`, snoozeUntil)
    } catch (e) {
      console.error('Failed to snooze loop:', e)
    }
  }

  // Determine if there are kid events
  const hasKidEvents = data?.kids && Object.values(data.kids).some(
    k => k?.logistics && Object.keys(k.logistics).length > 0
  )

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
      }}>
        <div style={{ color: colors.textDim, fontSize: 14 }}>Loading today's brief...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
      }}>
        <div style={{ color: colors.status.missing.color, fontSize: 14 }}>
          Error loading data: {error.message}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
        padding: 24,
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>☀️</div>
        <div style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 1.6 }}>
          Today's brief isn't ready yet —<br />
          check back after 6:50 am
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '0 0 80px 0',
      background: colors.bg,
      minHeight: '100vh',
      fontFamily: fonts.body,
    }}>
      <WeatherBar weather={data.weather} date={todayDate} />
      <DaySummary summary={data.summary} />
      {hasKidEvents && (
        <KidsSection
          kids={data.kids}
          todayDate={todayDate}
          onConfirm={handleLogisticsConfirm}
        />
      )}
      <CalendarSection events={data.calendar} />
      <ProjectsSection
        projects={data.projects}
        todayDate={todayDate}
        onDone={handleProjectDone}
      />
      <LoopsSection
        loops={data.loops}
        todayDate={todayDate}
        onDone={handleLoopDone}
        onSnooze={handleLoopSnooze}
      />
      {data.trip_countdowns?.length > 0 && (
        <TripCountdowns countdowns={data.trip_countdowns} />
      )}
    </div>
  )
}
