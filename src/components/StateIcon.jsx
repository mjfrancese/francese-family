// ── StateIcon — Inline SVG outlines for Missouri and Kentucky ──
// Simplified but recognizable shapes at 32x32 viewBox.

const STATE_PATHS = {
  // Missouri: rectangular with distinctive bootheel in the southeast
  // and the Missouri River notch on the western side near the middle.
  MO: "M8,4 L26,4 L27,5 L27,18 L25,18 L25,20 L29,20 L29,28 L23,28 L23,24 L21,24 L21,28 L10,28 L8,26 L6,22 L6,16 L8,12 L6,8 L8,4 Z",

  // Kentucky: roughly triangular/oval with western notch (Kentucky Bend)
  // and eastern notch (Big Sandy), bounded by the Ohio River on the north.
  KY: "M16,2 L24,3 L28,6 L30,10 L29,14 L27,18 L29,22 L27,26 L24,28 L18,30 L12,29 L7,27 L4,24 L3,20 L2,16 L4,12 L6,9 L8,7 L10,5 L12,4 L16,2 Z M16,10 L18,12 L18,16 L16,18 L14,16 L14,12 Z",
}

export default function StateIcon({ state, size = 20, color = 'currentColor', style = {} }) {
  const path = STATE_PATHS[state]
  if (!path) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      <path d={path} />
      {/* Dot for approximate location of major city */}
      {state === 'MO' && <circle cx="18" cy="14" r="1.5" fill={color} stroke="none" />}
      {state === 'KY' && <circle cx="14" cy="16" r="1.5" fill={color} stroke="none" />}
    </svg>
  )
}

export function StateLabel({ location, size = 12, color = 'currentColor' }) {
  const map = {
    'St. Louis': 'MO',
    'Kentucky': 'KY',
  }
  const state = map[location]
  if (!state) return <span style={{ fontSize: size }}>{location}</span>

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: size, color }}>
      <StateIcon state={state} size={size + 2} color={color} />
      {location}
    </span>
  )
}
