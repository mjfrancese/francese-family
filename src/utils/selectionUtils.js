// Helpers for Build-Your-Own selections, shared by the hook + components.
//
// A slot's stored value is { optionId: true | { travelerId: true, ... } }.
//   true                      → option chosen (whole group / unassigned)
//   { travelerId: true, ... } → option chosen, assigned to those travelers
// Multiple optionIds in one slot = the group split. Back-compatible with the
// old single-pick string format.

export function normSlot(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') return { [raw]: true } // legacy single-pick
  return raw
}

// Traveler ids assigned to a chosen option (empty = everyone / unassigned).
export function whoOf(val) {
  return val && typeof val === 'object' ? Object.keys(val) : []
}
