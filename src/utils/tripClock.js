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

// Normalize a Build-Your-Own slot's stored value to { optionId: true|{...} }.
// (Kept inline so tripClock stays dependency-light; mirrors selectionUtils.)
function normSlotLocal(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') return { [raw]: true }
  return raw
}

// Build a day's unified, time-sorted agenda from BOTH `events` and the `plan`,
// honoring the user's selections. This is what makes "you are here" roll with
// the choice system instead of going stale. Each item: { min, time, text, tz,
// source: 'event'|'fixed'|'choice', chosen }.
export function buildDayAgenda(day, daySelections = {}) {
  const items = []
  const dayTz = day?.tz || null

  for (const e of day?.events || []) {
    items.push({ min: parseEventMinutes(e.time), time: e.time || null, text: e.text || '', tz: e.tz || dayTz, source: 'event', chosen: true, slotId: null, who: [] })
  }

  for (const slot of day?.plan?.slots || []) {
    if (slot.fixed) {
      items.push({ min: parseEventMinutes(slot.time), time: slot.time || null, text: slot.label || slot.title || '', tz: dayTz, source: 'fixed', chosen: true, slotId: slot.id, who: [] })
      continue
    }
    const map = normSlotLocal(daySelections[slot.id])
    const chosen = (slot.options || []).filter((o) => o.id in map)
    if (chosen.length === 0) {
      items.push({ min: parseEventMinutes(slot.time), time: slot.time || null, text: `${slot.title} — choose`, tz: dayTz, source: 'choice', chosen: false, slotId: slot.id, who: [] })
    } else {
      for (const opt of chosen) {
        const rawWho = map[opt.id]
        const who = (rawWho && typeof rawWho === 'object') ? Object.keys(rawWho) : []
        items.push({ min: parseEventMinutes(slot.time), time: slot.time || null, text: opt.label, tz: dayTz, source: 'choice', chosen: true, slotId: slot.id, who })
      }
    }
  }

  const timed = items.filter((i) => i.min != null).sort((a, b) => a.min - b.min)
  const untimed = items.filter((i) => i.min == null)
  return [...timed, ...untimed]
}

// Group a day's timed agenda into buckets sharing a slot+time. The two arms of
// a SPLIT (same slot, same minute) group together; everything else is its own
// bucket. Order is preserved.
function makeBuckets(timed) {
  const buckets = []
  const byKey = new Map()
  timed.forEach((a, idx) => {
    const key = (a.source === 'choice' && a.slotId != null) ? `slot:${a.slotId}:${a.min}` : `item:${idx}`
    if (byKey.has(key)) byKey.get(key).push(a)
    else { const b = [a]; buckets.push(b); byKey.set(key, b) }
  })
  return buckets
}

// --- the engine --------------------------------------------------------------

// timeline: array of day objects (already sorted). meta: trip meta. nowInput: see
// buildNow. selections: shared Build-Your-Own picks (so now/next reflect choices).
// Returns a clock describing where "now" falls in the trip.
export function getTripClock(timeline, meta, nowInput, selections = {}) {
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
    // Unified agenda from events + plan + selections, so now/next reflect choices.
    const agenda = buildDayAgenda(today.raw, selections[today.id] || {})
    const timed = agenda.filter((a) => a.min != null)
    // nowMin measured in each item's own zone (travel days cross zones).
    const nowMinFor = (tz) => now.mode === 'wall' ? now.minutes : minutesInTz(now.date, tz || today.tz)
    // Group timed items into buckets that share a slot+time — the arms of a
    // SPLIT (two options chosen in one slot, with different travelers) belong
    // together so the banner can show both with who's on each.
    const buckets = makeBuckets(timed)
    let currentBucket = null
    let nextBucket = null
    for (const b of buckets) {
      if (b[0].min <= nowMinFor(b[0].tz)) currentBucket = b
    }
    for (const b of buckets) {
      if (b[0].min > nowMinFor(b[0].tz)) { nextBucket = b; break }
    }
    clock.today = today
    clock.agenda = agenda
    clock.currentItems = currentBucket || []
    clock.nextItems = nextBucket || []
    clock.currentItem = currentBucket ? currentBucket[0] : null // back-compat
    clock.nextItem = nextBucket ? nextBucket[0] : null
    // Legacy: DayCard highlights an event row by index. Only events (not plan
    // items) live in day.events, so map back when the current item is an event.
    const current = clock.currentItem
    clock.currentEventIndex = current && current.source === 'event'
      ? (today.raw.events || []).findIndex((e) => e.text === current.text && e.time === current.time)
      : -1
    // If nothing later today, fall to the IMMEDIATELY following day's first
    // time-slot (as a group) — never skip days to a distant reminder.
    if (!nextBucket) {
      const tomorrow = days[todayIdx + 1]
      if (tomorrow) {
        const tBuckets = makeBuckets(buildDayAgenda(tomorrow.raw, selections[tomorrow.id] || {}).filter((a) => a.min != null))
        if (tBuckets.length) {
          clock.nextDay = tomorrow
          clock.nextItems = tBuckets[0]
          clock.nextItem = tBuckets[0][0]
          clock.nextIsTomorrow = true
        }
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
