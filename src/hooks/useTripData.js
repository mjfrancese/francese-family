import { useState, useEffect } from 'react'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'

export function useTripData(slug) {
  const [data, setData] = useState({ meta: null, timeline: [], bookings: [], budget: null, flightOptions: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    async function fetchData() {
      setLoading(true)
      try {
        const tripRef = ref(db, `trips/${slug}`)
        const snapshot = await get(tripRef)
        const raw = snapshot.val()

        if (!raw) {
          setData({ meta: null, timeline: [], bookings: [], budget: null })
          setLoading(false)
          return
        }

        const timeline = raw.timeline
          ? Object.entries(raw.timeline).map(([id, d]) => ({ id, ...d })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : []

        const bookings = raw.bookings
          ? Object.entries(raw.bookings).map(([id, b]) => ({ id, ...b })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : []

        setData({
          meta: raw.meta || null,
          timeline,
          bookings,
          budget: raw.budget || null,
          flightOptions: raw.flightOptions || null,
        })
      } catch (err) {
        console.error('Failed to load trip data:', err)
      }
      setLoading(false)
    }

    fetchData()
  }, [slug])

  return { ...data, loading }
}
