import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'
import { normSlot } from '../utils/selectionUtils'

// Shared, realtime Build-Your-Own selections, with group-split support.
//
// Firebase shape: trips/{slug}/selections/{dayId}/{slotId}/{optionId} =
//   true                      → option chosen (whole group / unassigned)
//   { travelerId: true, ... } → option chosen, assigned to those travelers
// Multiple optionIds in one slot = the group split. Read via onValue so picks
// sync across every viewer (like the checklist). Back-compatible with the old
// single-string format. Reusable for any trip with a `plan`.
export function useSelections(slug) {
  const [selections, setSelections] = useState({})

  useEffect(() => {
    if (!slug) return
    const selRef = ref(db, `trips/${slug}/selections`)
    const unsub = onValue(selRef, (snap) => setSelections(snap.val() || {}))
    return () => unsub()
  }, [slug])

  const writeSlot = useCallback((dayId, slotId, map) => {
    if (!slug || !dayId || !slotId) return
    const path = `trips/${slug}/selections/${dayId}/${slotId}`
    set(ref(db, path), Object.keys(map).length ? map : null)
  }, [slug])

  // Add/remove an option in a slot (multi-select; toggles on/off).
  const toggleOption = useCallback((dayId, slotId, optionId) => {
    const cur = { ...normSlot(selections?.[dayId]?.[slotId]) }
    if (optionId in cur) delete cur[optionId]
    else cur[optionId] = true
    writeSlot(dayId, slotId, cur)
  }, [selections, writeSlot])

  // Add/remove a traveler on a chosen option (who's doing what when split).
  const toggleTraveler = useCallback((dayId, slotId, optionId, travelerId) => {
    const cur = { ...normSlot(selections?.[dayId]?.[slotId]) }
    if (!(optionId in cur)) cur[optionId] = true // ensure the option is chosen
    let who = cur[optionId]
    who = (who && typeof who === 'object') ? { ...who } : {}
    if (who[travelerId]) delete who[travelerId]
    else who[travelerId] = true
    cur[optionId] = Object.keys(who).length ? who : true
    writeSlot(dayId, slotId, cur)
  }, [selections, writeSlot])

  return { selections, toggleOption, toggleTraveler }
}
