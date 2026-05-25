import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'

export function useSequences() {
  const [sequences, setSequences] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, 'sequences')
    const unsub = onValue(r, snap => {
      setSequences(snap.val() || {})
      setLoading(false)
    })
    return unsub
  }, [])

  async function setStepStatus(seqId, stepIndex, status) {
    const updates = { status }
    if (status === 'done') updates.completed = new Date().toISOString().slice(0, 10)
    await set(ref(db, `sequences/${seqId}/steps/${stepIndex}`), {
      ...sequences[seqId]?.steps?.[stepIndex],
      ...updates,
    })
  }

  const list = Object.entries(sequences).map(([id, seq]) => ({
    id,
    ...seq,
    steps: Array.isArray(seq.steps) ? seq.steps : Object.values(seq.steps || {}),
  }))

  return { sequences, list, loading, setStepStatus }
}
