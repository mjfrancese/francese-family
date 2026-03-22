import { colors } from '../theme'
import {
  Plane, Theater, FerrisWheel, Mountain, Palmtree, Landmark,
  UtensilsCrossed, Music, GraduationCap, Heart, Home, PartyPopper,
  Ship, Tent, Camera, Star, Sparkles, MapPin, Calendar, Castle,
  Compass, Waves, Bike, Sun, Snowflake, TreePine, Umbrella, Anchor,
  Globe, Church, Building2, Footprints, Wine, Sunset,
} from 'lucide-react'

const iconMap = {
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
  ship: Ship,
  camping: Tent,
  tent: Tent,
  camera: Camera,
  star: Star,
  sparkles: Sparkles,
  pin: MapPin,
  calendar: Calendar,
  castle: Castle,
  compass: Compass,
  waves: Waves,
  beach: Waves,
  bike: Bike,
  sun: Sun,
  snow: Snowflake,
  ski: Snowflake,
  trees: TreePine,
  umbrella: Umbrella,
  anchor: Anchor,
  globe: Globe,
  church: Church,
  city: Building2,
  hike: Footprints,
  wine: Wine,
  sunset: Sunset,
}

// All available icons for the picker
export const availableIcons = Object.keys(iconMap).sort()

export function getIconComponent(name) {
  return iconMap[(name || '').toLowerCase()] || MapPin
}

/**
 * TripIcon renders a Lucide SVG icon in a colored circle.
 *
 * @param {string} icon - Icon name (e.g. "castle", "theater", "home")
 * @param {number} size - Size in pixels (default 24)
 * @param {string} tripColor - The trip's accent color
 */
export default function TripIcon({ icon, size = 24, tripColor }) {
  const color = tripColor || colors.accent
  const Icon = getIconComponent(icon)

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `${color}18`,
      border: `1.5px solid ${color}44`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={size * 0.5} color={color} />
    </div>
  )
}
