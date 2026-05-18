import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

function getTodayDateChicago() {
  const now = new Date()
  const chicagoStr = now.toLocaleString('en-US', { timeZone: 'America/Chicago' })
  const chicagoDate = new Date(chicagoStr)
  const y = chicagoDate.getFullYear()
  const m = String(chicagoDate.getMonth() + 1).padStart(2, '0')
  const d = String(chicagoDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useTodayData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const todayDate = getTodayDateChicago()

  useEffect(() => {
    const r = ref(db, `today/${todayDate}`)
    const unsub = onValue(
      r,
      (snap) => {
        setData(snap.val())
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [todayDate])

  return { data, loading, error, todayDate }
}
