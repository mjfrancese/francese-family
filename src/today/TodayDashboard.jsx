import { useState } from 'react'
import { colors, fonts } from '../theme'
import { useTodayData } from './useTodayData'
import WeatherBar from './WeatherBar'
import DaySummary from './DaySummary'
import IntentionSetter from './IntentionSetter'
import KidsSection from './KidsSection'
import CalendarSection from './CalendarSection'
import ProjectPulse from './ProjectPulse'
import LoopsSection from './LoopsSection'
import HouseholdSection from './HouseholdSection'
import TripCountdowns from './TripCountdowns'
import LiturgicalBanner from './LiturgicalBanner'
import TomorrowPreview from './TomorrowPreview'
import DinnerPlanner from './DinnerPlanner'
import TomorrowIntention from './TomorrowIntention'

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
  const { data: rawData, loading, error, todayDate, viewerKey } = useTodayData()
  const [localData, setLocalData] = useState(null)

  // dinnerData comes directly from data?.dinners (no separate state needed)

  // isEvening: true if current Chicago time is 7pm or later
  const currentHour = parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hour12: false }))
  const isEvening = currentHour >= 19

  const data = localData || rawData

  // viewerCalendar: prefer per-user calendar, fall back to global
  const viewerCalendar = data?.users?.[viewerKey]?.calendar || data?.calendar || []

  // Filter projects by who field client-side -- single source of truth at data.projects
  const viewerProjects = Object.fromEntries(
    Object.entries(data?.projects || {}).filter(([, p]) => {
      const who = p?.who || 'michael'
      return who === 'both' || who === viewerKey
    })
  )

  // Sync dinnerData from Firebase data
  // Sync dinnerData from Firebase when it changes (use useEffect to avoid setState-in-render)
  // This is handled reactively via the onValue listener in useTodayData

  // hasKidLogistics: at least one unconfirmed logistics entry
  const hasKidLogistics = data?.kids && Object.values(data.kids).some(
    k => k?.logistics && Object.values(k.logistics).some(e => !e.confirmed)
  )

  async function handleSetIntention(text) {
    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return { ...base, intention: text }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/intentions/${viewerKey}`, text)
    } catch (e) {
      console.error('Failed to set intention:', e)
    }
  }

  async function handleLogisticsConfirm(kid, eventId, person) {
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
          [slug]: { ...base.projects?.[slug], done_today: true },
        },
      }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/projects/${slug}/done_today`, true)
    } catch (e) {
      console.error('Failed to mark project done:', e)
    }
  }

  async function handleProjectLog(slug, text) {
    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return {
        ...base,
        projects: {
          ...base.projects,
          [slug]: {
            ...base.projects?.[slug],
            todays_note: text,
            last_log: text,
          },
        },
      }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/projects/${slug}/todays_note`, text)
    } catch (e) {
      console.error('Failed to log project note:', e)
    }
  }

  async function handleLoopDone(id) {
    setLocalData(prev => {
      const base = prev || rawData
      if (!base) return base
      return {
        ...base,
        loops: { ...base.loops, [id]: { ...base.loops?.[id], done: true } },
      }
    })
    try {
      await firebaseRestPut(`today/${todayDate}/loops/${id}/done`, true)
    } catch (e) {
      console.error('Failed to mark loop done:', e)
    }
  }

  async function handleLoopSnooze(id) {
    const now = new Date()
    const next = new Date(now)
    next.setDate(now.getDate() + 7)
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

  async function handleDinnerUpdate(weekKey, dayKey, value) {
    // Write directly to Firebase -- onValue listener will update rawData automatically
    try {
      await firebaseRestPut(`dinners/${weekKey}/${dayKey}`, value)
    } catch (e) {
      console.error('Failed to update dinner:', e)
    }
  }

  function getDayKey(dateStr) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    return days[new Date(dateStr + 'T12:00:00').getDay()]
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: fonts.body,
      }}>
        <div style={{ color: colors.textDim, fontSize: 14 }}>Loading today's brief...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        minHeight: '100vh', background: colors.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: fonts.body, padding: 24,
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
      background: colors.bg,
      minHeight: '100vh',
      paddingBottom: 80,
      fontFamily: fonts.body,
    }}>
      <WeatherBar
          weather={data.weather}
          todayDate={todayDate}
          viewerKey={viewerKey}
          michaelCalendar={data?.users?.michael?.calendar || []}
          meghanCalendar={data?.users?.meghan?.calendar || []}
        />
      {viewerKey === 'meghan' && (
        <LiturgicalBanner liturgicalSeason={data?.liturgical_season} />
      )}
      <DaySummary summary={data.summary} />
      <IntentionSetter
        todayDate={todayDate}
        currentIntention={data?.intentions?.[viewerKey] || data?.intention}
        viewerKey={viewerKey}
        onSet={handleSetIntention}
      />
      {isEvening && (
        <div style={{ padding: '12px 20px 0', fontSize: 12, color: '#8a8aaa', letterSpacing: '0.08em' }}>
          🌙 End of day — how did it go?
        </div>
      )}
      {isEvening && (
        <TomorrowIntention
          todayDate={todayDate}
          viewerKey={viewerKey}
          currentValue={data?.intentions?.[viewerKey + '_tomorrow']}
          onSet={(text) => firebaseRestPut(`today/${todayDate}/intentions/${viewerKey}_tomorrow`, text)}
        />
      )}
      {hasKidLogistics && (
        <KidsSection
          kids={data.kids}
          todayDate={todayDate}
          michaelCalendar={data?.users?.michael?.calendar || []}
          meghanCalendar={data?.users?.meghan?.calendar || []}
          onConfirm={handleLogisticsConfirm}
        />
      )}
      <CalendarSection events={viewerCalendar} viewerKey={viewerKey} />
      <DinnerPlanner
        dinnerData={data?.dinners}
        todayDate={todayDate}
        onDinnerUpdate={handleDinnerUpdate}
      />
      <HouseholdSection household={data.household} viewerKey={viewerKey} />
      <ProjectPulse
        projects={viewerProjects}
        todayDate={todayDate}
        onDone={handleProjectDone}
        onLog={handleProjectLog}
      />
      <LoopsSection
        loops={data.loops}
        todayDate={todayDate}
        onDone={handleLoopDone}
        onSnooze={handleLoopSnooze}
      />
      <TomorrowPreview
        data={data}
        viewerKey={viewerKey}
      />
      {data.trip_countdowns?.length > 0 && (
        <TripCountdowns countdowns={data.trip_countdowns} />
      )}
    </div>
  )
}