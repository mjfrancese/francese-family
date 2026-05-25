import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'

export function useFamilyStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'family-status')
    const unsub = onValue(r, snap => {
      setStatus(snap.val())
      setLoading(false)
    })
    return unsub
  }, [])

  async function setOverallStatus(overall, message) {
    await set(ref(db, 'family-status/overall'), overall)
    if (message !== undefined) await set(ref(db, 'family-status/message'), message)
    await set(ref(db, 'family-status/updated'), new Date().toISOString())
  }

  const overallColor = {
    'on-track': '#5ce892',
    'needs-attention': '#e8c55c',
    'action-required': '#e85c5c',
  }[status?.overall] || '#8a8aaa'

  const overallLabel = {
    'on-track': 'On Track',
    'needs-attention': 'Needs Attention',
    'action-required': 'Action Required',
  }[status?.overall] || 'Unknown'

  return { status, loading, overallColor, overallLabel, setOverallStatus }
}
