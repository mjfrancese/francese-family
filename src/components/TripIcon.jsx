import { colors } from '../theme'
import {
  Plane, Theater, FerrisWheel, Mountain, Palmtree, Landmark,
  UtensilsCrossed, Music, GraduationCap, Heart, Home, PartyPopper,
  Ship, Tent, Camera, Star, Sparkles, MapPin, Calendar
} from 'lucide-react'

// Dynamic import of flag components by country code
import US from 'country-flag-icons/react/3x2/US'
import GB from 'country-flag-icons/react/3x2/GB'
import FR from 'country-flag-icons/react/3x2/FR'
import IT from 'country-flag-icons/react/3x2/IT'
import ES from 'country-flag-icons/react/3x2/ES'
import DE from 'country-flag-icons/react/3x2/DE'
import JP from 'country-flag-icons/react/3x2/JP'
import MX from 'country-flag-icons/react/3x2/MX'
import CA from 'country-flag-icons/react/3x2/CA'
import GR from 'country-flag-icons/react/3x2/GR'
import IE from 'country-flag-icons/react/3x2/IE'
import PT from 'country-flag-icons/react/3x2/PT'
import BR from 'country-flag-icons/react/3x2/BR'
import AU from 'country-flag-icons/react/3x2/AU'
import NZ from 'country-flag-icons/react/3x2/NZ'
import TH from 'country-flag-icons/react/3x2/TH'
import CR from 'country-flag-icons/react/3x2/CR'
import IS from 'country-flag-icons/react/3x2/IS'
import CH from 'country-flag-icons/react/3x2/CH'
import NL from 'country-flag-icons/react/3x2/NL'
import SE from 'country-flag-icons/react/3x2/SE'
import NO from 'country-flag-icons/react/3x2/NO'
import DK from 'country-flag-icons/react/3x2/DK'
import AT from 'country-flag-icons/react/3x2/AT'
import CZ from 'country-flag-icons/react/3x2/CZ'
import HR from 'country-flag-icons/react/3x2/HR'
import HU from 'country-flag-icons/react/3x2/HU'
import PL from 'country-flag-icons/react/3x2/PL'
import IL from 'country-flag-icons/react/3x2/IL'
import KR from 'country-flag-icons/react/3x2/KR'
import IN from 'country-flag-icons/react/3x2/IN'
import CN from 'country-flag-icons/react/3x2/CN'
import CO from 'country-flag-icons/react/3x2/CO'
import AR from 'country-flag-icons/react/3x2/AR'
import JM from 'country-flag-icons/react/3x2/JM'
import BS from 'country-flag-icons/react/3x2/BS'
import CU from 'country-flag-icons/react/3x2/CU'

const flagComponents = {
  US, GB, FR, IT, ES, DE, JP, MX, CA, GR, IE, PT, BR, AU, NZ,
  TH, CR, IS, CH, NL, SE, NO, DK, AT, CZ, HR, HU, PL, IL, KR,
  IN, CN, CO, AR, JM, BS, CU,
}

const lucideIcons = {
  plane: Plane,
  theater: Theater,
  ferriswheel: FerrisWheel,
  mountain: Mountain,
  palm: Palmtree,
  landmark: Landmark,
  dining: UtensilsCrossed,
  music: Music,
  graduation: GraduationCap,
  heart: Heart,
  home: Home,
  party: PartyPopper,
  cruise: Ship,
  camping: Tent,
  camera: Camera,
  star: Star,
  sparkles: Sparkles,
  pin: MapPin,
  calendar: Calendar,
}

/**
 * TripIcon renders an icon for a trip based on the `icon` field in meta.
 *
 * Supported formats:
 *   "flag:US"      → US flag SVG
 *   "flag:GB+FR"   → Combined GB+FR flags (for multi-country trips)
 *   "lucide:theater" → Lucide theater icon
 *   "🎭"           → Legacy emoji fallback (rendered as text)
 *
 * @param {string} icon - The icon descriptor string
 * @param {number} size - Size in pixels (default 24)
 * @param {string} tripColor - The trip's accent color
 */
export default function TripIcon({ icon, size = 24, tripColor }) {
  const color = tripColor || colors.accent

  if (!icon) {
    return (
      <div style={circleStyle(size, color)}>
        <MapPin size={size * 0.5} color={color} />
      </div>
    )
  }

  // Flag icon: "flag:US" or "flag:GB+FR"
  if (icon.startsWith('flag:')) {
    const codes = icon.slice(5).split('+')

    if (codes.length === 1) {
      const FlagComp = flagComponents[codes[0].toUpperCase()]
      if (FlagComp) {
        return (
          <div style={flagContainerStyle(size)}>
            <FlagComp style={{ width: size, height: size * 0.67, borderRadius: 3, display: 'block' }} />
          </div>
        )
      }
    }

    // Multi-flag: render side by side
    if (codes.length > 1) {
      const flagSize = size * 0.7
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {codes.map((code, i) => {
            const FlagComp = flagComponents[code.toUpperCase()]
            if (!FlagComp) return null
            return (
              <div key={code} style={{
                ...flagContainerStyle(flagSize),
                marginLeft: i > 0 ? -flagSize * 0.15 : 0,
                zIndex: codes.length - i,
              }}>
                <FlagComp style={{ width: flagSize, height: flagSize * 0.67, borderRadius: 2, display: 'block' }} />
              </div>
            )
          })}
        </div>
      )
    }
  }

  // Lucide icon: "lucide:theater"
  if (icon.startsWith('lucide:')) {
    const iconName = icon.slice(7).toLowerCase()
    const LucideIcon = lucideIcons[iconName]
    if (LucideIcon) {
      return (
        <div style={circleStyle(size, color)}>
          <LucideIcon size={size * 0.5} color={color} />
        </div>
      )
    }
  }

  // Legacy emoji fallback
  return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
}

function circleStyle(size, color) {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `${color}18`,
    border: `1.5px solid ${color}44`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

function flagContainerStyle(size) {
  return {
    flexShrink: 0,
    lineHeight: 0,
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  }
}
