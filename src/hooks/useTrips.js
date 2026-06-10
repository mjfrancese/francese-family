import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db, sanitizeEmail } from '../firebase'

export function useTrips(user) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) {
      setTrips([])
      setLoading(false)
      return
    }

    const tripsRef = ref(db, 'trips')
    const unsub = onValue(tripsRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setTrips([])
        setLoading(false)
        return
      }

      const sanitized = sanitizeEmail(user.email)
      const accessible = []

      for (const [slug, trip] of Object.entries(data)) {
        const entry = trip.access && trip.access[sanitized]
        if (entry) {
          // Surprise-hidden viewers get the trip's meta.surprise overrides
          // (e.g. a London-only title/icon/dates) so the card reveals nothing.
          const override = entry.hideSurprise && trip.meta?.surprise ? trip.meta.surprise : null
          accessible.push({
            slug,
            ...trip.meta,
            ...(override || {}),
            surprise: undefined,
            role: entry.role,
          })
        }
      }

      accessible.sort((a, b) => {
        const order = { upcoming: 0, planning: 1, complete: 2 }
        return (order[a.status] ?? 1) - (order[b.status] ?? 1)
      })

      setTrips(accessible)
      setLoading(false)
    })

    return () => unsub()
  }, [user?.email])

  return { trips, loading }
}
