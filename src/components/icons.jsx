// ── icons.jsx — All custom SVG icons for francese.family ──
// State outlines from simplemaps US SVG (real map data).
// Landmark icons from Iconify API (Tabler, Material Design Icons).
// General icons from Lucide (already in project).

import { createElement } from 'react'

// ── State outline paths (from simplemaps.com US SVG, public domain) ──────────

const STATE_PATHS = {
  MO: "m 653.66898,242.44599 -4.7561,-4.17372 -20.86857,2.62071 -21.25682,1.8442 -19.89794,0.58238 0,0 -0.0971,0.58238 2.42657,4.65903 2.23246,1.553 2.6207,4.65903 0.38825,0.38826 0.97063,0.7765 2.32952,1.65008 2.52364,-0.0971 1.35888,2.42658 -3.39721,4.17371 3.49428,3.10602 0.38825,1.94127 4.36784,2.52364 2.42658,41.0577 0.0971,2.52364 0.19413,2.52364 0.0971,2.52364 0.19413,2.6207 0.0971,2.52365 4.56197,-0.29119 31.25432,-2.52364 36.98105,-3.59134 1.8442,3.78546 -4.27078,6.79442 10.48282,-1.55301 0.0971,0 0,-0.7765 0.19413,-4.46491 1.94126,-2.42658 -0.58238,-2.71776 -0.0971,-0.0971 -0.0971,-0.0971 0.38825,-1.26182 0.58238,0.19413 0.29119,0.7765 -0.0971,0.29119 0,0.0971 0,0.77651 0.38826,0.0971 0.7765,-0.97063 0,-0.0971 0.0971,-0.29119 2.52364,-1.55301 0.38826,-0.19413 0.87357,-7.95917 -0.19413,-0.38826 -0.29119,-0.0971 -6.89148,-5.62966 1.06769,-2.03833 -1.94126,-5.53259 -3.49427,-2.71777 -6.60029,-2.9119 -4.17372,-3.3972 0.48532,-6.98855 1.26182,-6.50323 -6.98855,0.38825 -2.13539,-2.23245 -0.97063,-4.4649 -11.06519,-9.31806 -3.10602,-8.63862 0.7765,-4.27078 0,0 -0.19412,-0.19412 z",
  KY: "m 693.17367,317.18459 -0.29119,-0.7765 -0.58238,-0.19413 -0.38825,1.26182 0.0971,0.0971 1.06769,-0.0971 0.0971,-0.29119 z m 66.39117,-63.47928 -0.19413,0.19413 1.26182,4.75609 -5.2414,4.17371 -4.27078,0.0971 0.97063,3.6884 -6.11498,8.05623 0.0971,2.81483 -6.89148,-0.58237 -2.52365,4.95022 -4.65903,-0.67945 -3.10602,2.32952 -0.58237,2.23245 -5.43554,-2.03833 -4.36784,1.45595 -3.59133,0 -1.45595,2.71777 -0.38825,0.0971 0,0.29119 -1.45595,3.30015 1.65007,2.32951 -6.11497,3.59134 1.45594,4.27077 -1.8442,2.13539 -7.47386,-2.03832 -1.94126,4.56196 0.58238,0.58238 0.19413,0.38826 -0.87357,7.95917 -0.38826,0.19413 -2.52364,1.55301 -0.0971,0.29119 2.81483,-0.38826 19.60675,-2.6207 -0.97063,-3.88252 3.30015,-0.0971 39.50469,-5.24141 27.76005,-4.65903 0.38825,-0.29119 0.67944,-0.7765 7.27974,-3.88252 5.62966,-7.3768 0.7765,-2.52364 3.6884,-2.9119 4.65903,-5.92085 0.67944,-0.97063 -0.29119,-0.0971 -2.42657,0 -3.10602,-1.74714 -5.5326,-6.69735 -1.94126,-6.79442 0,-0.19413 -0.19413,-0.19412 -4.07665,-2.32952 -1.8442,-3.10602 -3.6884,3.59134 -2.32951,0.58238 -2.9119,-1.16476 -2.52364,1.94126 -5.24141,-2.32951 -1.35888,0.58237 -4.95022,-4.27077 -2.52364,-1.26182 -4.75609,0.58238 -0.77651,0.7765 z",
  NH: "m 455.81,126.16 44.96,-82.01 -20.16,-13.36 68.22,-29.31 66.67,24.49 20.16,-25.97 57.36,758.09 -15.50,73.84 77.52,67.16 -9.30,41.19 54.26,30.06 -49.61,80.89 -91.47,5.57 -113.18,70.13 -503.88,-12.99 -41.86,-53.80 15.50,-48.24 32.56,-20.41 27.91,-243.42 75.97,-84.97 74.42,-138.41 -15.50,-42.67 15.50,-56.40 94.57,-14.84 102.33,-63.82 10.85,-53.80 -32.56,-51.95 57.36,-70.87 -20.16,-33.03 17.05,-11.13 z",
  FL: "m 276.86,0.00 14.73,30.47 278.75,15.01 4.53,22.06 13.98,-1.18 9.44,-48.09 54.77,13.56 17.37,93.02 72.52,129.37 0.76,51.53 56.28,136.69 -10.20,107.76 -24.93,51.26 20.02,-21.06 -41.55,55.96 -10.20,4.88 21.53,-31.73 -64.97,9.49 -21.91,-59.85 -42.30,-17.36 -18.89,-55.42 -32.86,-31.82 11.33,-29.11 -20.40,25.04 -49.86,-86.24 34.75,-38.06 -29.08,-13.29 10.58,22.24 -15.11,21.43 -12.46,-26.40 17.00,-109.66 -99.72,-103.15 -66.48,-22.33 -7.93,20.88 -81.96,19.35 45.33,-4.97 -32.86,17.27 -36.64,-6.42 -7.93,-30.56 -91.78,-43.48 -128.42,8.77 12.09,-41.49 -24.17,-20.16 3.78,-13.83 273.09,-0.36 z",
}

const STATE_VIEWBOX = {
  MO: "581.2 232.7 122.5 102.5",
  KY: "686.0 246.4 129.9 77.0",
  NH: "-0.0 -0.0 800.0 1126.9",
  FL: "0.0 0.0 800.0 641.2",
}

// Rotation to level each state's bottom edge (degrees).
// MO/KY from simplemaps convex-hull regression; NH/FL from us-atlas TopoJSON.
const STATE_ROTATE = {
  MO: -3,    // slight correction to visually level the northern border
  KY: 10,    // Ohio River border has ~10° tilt
  NH: 0,     // upright — TopoJSON 10m, 30 pts, self-intersection free
  FL: 0,     // distinctive diagonal shape — TopoJSON 10m, 45 pts mainland only
}

// ── Landmark paths (from Iconify API — Tabler & MDI, MIT licensed) ──────────

const LANDMARK_PATHS = {
  // Tabler: building-castle (stroke-based)
  castle: {
    d: "M15 19v-2a3 3 0 0 0-6 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5h4v3h3V5h4v3h3V5h4v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1M3 11h18",
    stroke: true,
  },
  // Tabler: tower (stroke-based)
  tower: {
    d: "M5 3h1a1 1 0 0 1 1 1v2h3V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2h3V4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4.394a2 2 0 0 1-.336 1.11l-1.328 1.992a2 2 0 0 0-.336 1.11V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V13.606a2 2 0 0 0-.336-1.11l-1.328-1.992a2 2 0 0 1-.336-1.11V4a1 1 0 0 1 1-1",
    stroke: true,
  },
  // MDI: eiffel-tower (fill-based)
  eiffel: {
    d: "M8.21 17c.44-.85.85-1.84 1.23-3H9v-2h1c.61-2.6 1-5.87 1-10h2c0 4.13.4 7.4 1 10h1v2h-.44c.38 1.16.79 2.15 1.23 3H17v2l2 3h-2.42c-.77-1.76-2.53-3-4.58-3s-3.81 1.24-4.58 3H5l2-3l-.03-2zm4.38-3h-1.18a22 22 0 0 1-1.13 3h3.44c-.4-.87-.79-1.87-1.13-3",
    stroke: false,
  },
  // Font Awesome: landmark (classical government building — for London)
  bigben: {
    d: "M501.62 92.11L267.24 2.04a31.96 31.96 0 0 0-22.47 0L10.38 92.11A16 16 0 0 0 0 107.09V144c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-36.91c0-6.67-4.14-12.64-10.38-14.98M64 192v160H48c-8.84 0-16 7.16-16 16v48h448v-48c0-8.84-7.16-16-16-16h-16V192h-64v160h-96V192h-64v160h-96V192zm432 256H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16",
    stroke: false,
    viewBox: "0 0 512 512",
  },
}

// ── React Components ─────────────────────────────────────────────────────────

export function StateIcon({ state, size = 24, color = 'currentColor', style = {} }) {
  const path = STATE_PATHS[state]
  const viewBox = STATE_VIEWBOX[state]
  const rotate = STATE_ROTATE[state]

  // Use SVG outline if we have a verified path + rotation (all 4 states).
  // Fall back to abbreviation badge if path/viewBox/rotate data is missing.
  if (path && viewBox && rotate !== undefined) {
    const [vbx, vby, vbw, vbh] = viewBox.split(' ').map(Number)
    const cx = vbx + vbw / 2
    const cy = vby + vbh / 2

    return createElement('svg', {
      width: size, height: size, viewBox,
      fill: 'none', stroke: color, strokeWidth: 3,
      strokeLinecap: 'round', strokeLinejoin: 'round',
      style: { flexShrink: 0, ...style },
    }, createElement('g', {
      transform: `rotate(${rotate}, ${cx}, ${cy})`,
      key: 'rotated',
    },
      createElement('path', { d: path, fill: 'currentColor', stroke: 'none', opacity: 0.15, key: 'fill' }),
      createElement('path', { d: path, fill: 'none', key: 'outline' })
    ))
  }

  // Abbreviation badge fallback
  const label = state || '?'
  return createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: size / 4,
      background: color + '18', border: `1.5px solid ${color}44`,
      color, fontSize: size * 0.42, fontWeight: 700,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.02em',
      flexShrink: 0, ...style,
    },
  }, label)
}

export function LandmarkIcon({ landmark, size = 20, color = 'currentColor', style = {} }) {
  const data = LANDMARK_PATHS[landmark]
  if (!data) return null

  const vb = data.viewBox || '0 0 24 24'
  const props = {
    width: size, height: size, viewBox: vb,
    style: { flexShrink: 0, ...style },
    ...(data.stroke
      ? { fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
      : { fill: color, stroke: 'none' }
    ),
  }

  return createElement('svg', props, createElement('path', { d: data.d }))
}

// Destination → landmark mapping
const DEST_MAP = {
  paris: 'eiffel', london: 'bigben', disney: 'castle', disneyland: 'castle',
  'disneyland paris': 'castle', 'new hampshire': 'tower',
}

export function DestinationIcon({ name, size = 20, color = 'currentColor', style = {} }) {
  const n = (name || '').toLowerCase()
  for (const [key, icon] of Object.entries(DEST_MAP)) {
    if (n.includes(key)) return LandmarkIcon({ landmark: icon, size, color, style })
  }
  return null
}
