import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'

export function useLoops() {
  const [loops, setLoops] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'loops')
    const unsub = onValue(r, snap => {
      setLoops(snap.val() || {})
      setLoading(false)
    })
    return unsub
  }, [])

  async function markDone(id) {
    await set(ref(db, `loops/${id}/status`), 'done')
  }

  async function markOpen(id) {
    await set(ref(db, `loops/${id}/status`), 'open')
  }

  const openLoops = Object.entries(loops)
    .filter(([, l]) => l.status !== 'done')
    .sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 }
      const ua = urgencyOrder[a[1].urgency] ?? 1
      const ub = urgencyOrder[b[1].urgency] ?? 1
      if (ua !== ub) return ua - ub
      if (a[1].due && b[1].due) return a[1].due.localeCompare(b[1].due)
      if (a[1].due) return -1
      if (b[1].due) return 1
      return 0
    })
    .map(([id, loop]) => ({ id, ...loop }))

  const doneLoops = Object.entries(loops)
    .filter(([, l]) => l.status === 'done')
    .map(([id, loop]) => ({ id, ...loop }))

  return { loops, openLoops, doneLoops, loading, markDone, markOpen }
}
