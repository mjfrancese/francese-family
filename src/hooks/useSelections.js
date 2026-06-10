import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'

// Shared, realtime "Build-Your-Own" plan selections for a trip.
//
// Stored at trips/{slug}/selections/{dayId}/{slotId} = optionId. Because it's
// read with onValue (like the checklist), every viewer sees the same picks —
// a choice Michael makes shows up for Meghan instantly. Writes are sticky;
// passing null clears a slot (toggle off). Reusable for any trip with a `plan`.
export function useSelections(slug) {
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const selRef = ref(db, `trips/${slug}/selections`)
    const unsub = onValue(selRef, (snap) => {
      setSelections(snap.val() || {})
      setLoading(false)
    })
    return () => unsub()
  }, [slug])

  // optionId null/undefined clears the slot (toggle off / deselect).
  const setSelection = useCallback((dayId, slotId, optionId) => {
    if (!slug || !dayId || !slotId) return
    set(ref(db, `trips/${slug}/selections/${dayId}/${slotId}`), optionId || null)
  }, [slug])

  return { selections, setSelection, loading }
}
