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
        if (trip.access && trip.access[sanitized]) {
          accessible.push({
            slug,
            ...trip.meta,
            role: trip.access[sanitized].role,
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
