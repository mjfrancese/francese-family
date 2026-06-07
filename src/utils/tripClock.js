// tripClock — reusable, timezone-aware "where are we in the trip" engine.
//
// Pure functions, no React, no dependencies. Works for ANY trip whose timeline
// days carry an absolute date + IANA timezone. Degrades gracefully (status
// 'unknown') when a trip lacks that metadata, so older trips render normally.
//
// Per-day fields it understands (all optional, but date is required for awareness):
//   day.date  -> 'YYYY-MM-DD'              (or derived from meta.year + month + dayNum)
//   day.tz    -> IANA zone e.g. 'Europe/London'  (falls back to meta.tz, then device)
//   event.tz  -> per-event IANA override (for travel days that cross zones)
//
// "now" can be a Date (real clock) or a '?now=YYYY-MM-DDTHH:MM' preview string.

const MONTHS = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
}

const pad = (n) => String(n).padStart(2, '0')

// --- now resolution ----------------------------------------------------------

// Accepts a Date, undefined (=> real now), or a preview string.
// Preview 'YYYY-MM-DDTHH:MM' is treated as wall-clock in each day's own zone,
// so previews read intuitively regardless of the viewer's device timezone.
export function buildNow(input) {
  if (typeof input === 'string') {
    const m = input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/)
    if (m) return { mode: 'wall', dateStr: m[1], minutes: Number(m[2]) * 60 + Number(m[3]) }
    const parsed = new Date(input)
    if (!isNaN(parsed)) return { mode: 'real', date: parsed }
  }
  if (input instanceof Date && !isNaN(input)) return { mode: 'real', date: input }
  return { mode: 'real', date: new Date() }
}

function deviceTz() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' }
}

// 'YYYY-MM-DD' for an instant, as seen in a given zone.
function dateStrInTz(date, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Minutes since midnight for an instant, as seen in a given zone.
function minutesInTz(date, tz) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)
  const get = (t) => Number(parts.find((p) => p.type === t)?.value)
  let h = get('hour')
  if (h === 24) h = 0 // some engines emit 24 at midnight
  return h * 60 + get('minute')
}

// --- day metadata ------------------------------------------------------------

function tripYear(meta) {
  if (meta?.year) return Number(meta.year)
  const m = String(meta?.dates || '').match(/\b(20\d{2})\b/)
  return m ? Number(m[1]) : null
}

// Resolve a day to 'YYYY-MM-DD'. Prefer explicit day.date; otherwise derive from
// meta year + the day's month abbreviation + dayNum.
export function resolveDayDate(day, meta) {
  if (day?.date && /^\d{4}-\d{2}-\d{2}$/.test(day.date)) return day.date
  const year = tripYear(meta)
  const mon = MONTHS[String(day?.month || '').toUpperCase().slice(0, 3)]
  const dnum = Number(day?.dayNum)
  if (year && mon && dnum) return `${year}-${pad(mon)}-${pad(dnum)}`
  return null
}

export function resolveDayTz(day, meta) {
  return day?.tz || meta?.tz || deviceTz()
}

// --- time parsing ------------------------------------------------------------

// Pulls the first HH:MM out of an event time string. Handles '~13:00',
// '08:30–09:30', '13:00', leading symbols. Returns minutes or null.
export function parseEventMinutes(timeStr) {
  if (!timeStr) return null
  const m = String(timeStr).match(/(\d{1,2}):(\d{2})/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

// --- friendly labels ---------------------------------------------------------

export function zoneLabel(tz) {
  if (!tz) return ''
  const seg = tz.split('/').pop() || tz
  return seg.replace(/_/g, ' ')
}

function ymdToUTC(s) {
  const [y, m, d] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function daysBetween(a, b) {
  return Math.round((ymdToUTC(b) - ymdToUTC(a)) / 86400000)
}

// --- the engine --------------------------------------------------------------

// timeline: array of day objects (already sorted). meta: trip meta. nowInput: see buildNow.
// Returns a clock describing where "now" falls in the trip.
export function getTripClock(timeline, meta, nowInput) {
  const empty = { enabled: false, status: 'unknown' }
  if (!Array.isArray(timeline) || timeline.length === 0) return empty

  const now = buildNow(nowInput)
  const days = timeline.map((d) => ({
    id: d.id,
    raw: d,
    date: resolveDayDate(d, meta),
    tz: resolveDayTz(d, meta),
  }))

  if (!days.some((d) => d.date)) return empty // no awareness possible

  // Classify each day relative to "now" (each compared in its own zone).
  days.forEach((d) => {
    if (!d.date) { d.phase = 'unknown'; return }
    const wallDate = now.mode === 'wall' ? now.dateStr : dateStrInTz(now.date, d.tz)
    d.wallDate = wallDate
    if (d.date < wallDate) d.phase = 'past'
    else if (d.date > wallDate) d.phase = 'future'
    else d.phase = 'today'
  })

  const total = days.length
  const todayIdx = days.findIndex((d) => d.phase === 'today')
  const firstDated = days.find((d) => d.date)
  const lastDated = [...days].reverse().find((d) => d.date)
  const refWall = now.mode === 'wall' ? now.dateStr : dateStrInTz(now.date, firstDated.tz)

  let status
  if (todayIdx !== -1) status = 'active'
  else if (firstDated.date > refWall) status = 'upcoming'
  else if (lastDated.date < refWall) status = 'complete'
  else status = 'active' // in a gap between listed days

  const clock = {
    enabled: true,
    status,
    total,
    todayId: todayIdx !== -1 ? days[todayIdx].id : null,
    todayIndex: todayIdx, // 0-based
    days,
    now,
  }

  if (status === 'upcoming') {
    clock.daysUntilStart = daysBetween(refWall, firstDated.date)
    clock.nextDay = firstDated
  }

  if (status === 'active' && todayIdx !== -1) {
    const today = days[todayIdx]
    const evts = (today.raw.events || []).map((e, i) => ({
      i, event: e, min: parseEventMinutes(e.time), tz: e.tz || today.tz,
    }))
    const timed = evts.filter((e) => e.min != null)
    // nowMin must be measured in each event's own zone; group by zone lazily.
    const nowMinFor = (tz) => now.mode === 'wall' ? now.minutes : minutesInTz(now.date, tz)
    let current = null
    let next = null
    for (const e of timed) {
      if (e.min <= nowMinFor(e.tz)) current = e
    }
    for (const e of timed) {
      if (e.min > nowMinFor(e.tz)) { next = e; break }
    }
    clock.today = today
    clock.currentEventIndex = current ? current.i : -1
    clock.currentEvent = current ? current.event : null
    clock.nextEvent = next ? next.event : null
    // If nothing later today, look to the next future day's first event.
    if (!next) {
      const fut = days.slice(todayIdx + 1).find((d) => (d.raw.events || []).length)
      if (fut) {
        clock.nextDay = fut
        clock.nextEvent = fut.raw.events[0]
        clock.nextIsTomorrow = true
      }
    }
    // Local clock label for the banner.
    if (now.mode === 'real') {
      clock.localTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: today.tz, hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(now.date)
    } else {
      clock.localTime = `${pad(Math.floor(now.minutes / 60))}:${pad(now.minutes % 60)}`
    }
    clock.localZone = zoneLabel(today.tz)
  }

  return clock
}
