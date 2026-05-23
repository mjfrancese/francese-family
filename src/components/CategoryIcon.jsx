// ── CategoryIcon — Clean SVG icons for event categories ──
// Uses Lucide icons (already in project). No emojis.

import {
  Music, Star, Users, Plane, Tent, BookOpen, Cake, Car, Eye,
  MapPin, Home, Info, Calendar, ChevronRight, AlertTriangle,
  User, Flag, Clock, Navigation, Compass,
} from 'lucide-react'

const CATEGORY_ICONS = {
  louise:     { icon: Music,        color: '#f472b6', label: 'Louise' },
  kenna:      { icon: Star,         color: '#a78bfa', label: 'Kenna' },
  'both-kids': { icon: Users,       color: '#fbbf24', label: 'Both' },
  family:     { icon: Home,         color: '#60a5fa', label: 'Family' },
  trip:       { icon: Compass,      color: '#2dd4bf', label: 'Trip' },
  camp:       { icon: Tent,         color: '#34d399', label: 'Camp' },
  school:     { icon: BookOpen,     color: '#fb923c', label: 'School' },
  milestone:  { icon: Cake,         color: '#9ca3af', label: 'Birthdays' },
  dance:      { icon: Music,        color: '#f472b6', label: 'Dance' },
}

const LOGISTICS_ICONS = {
  transport:  { icon: Car,    color: '#fbbf24', label: 'Drop off / Pick up' },
  attendance: { icon: Eye,    color: '#60a5fa', label: 'Parent stays' },
  travel:     { icon: Plane,  color: '#2dd4bf', label: 'Family travel' },
  info:       { icon: Info,   color: '#9ca3af', label: 'Heads up' },
}

export function CategoryIcon({ category, size = 14, showLabel = false }) {
  const config = CATEGORY_ICONS[category]
  if (!config) return null
  const Icon = config.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: showLabel ? 4 : 0, color: config.color }}>
      <Icon size={size} strokeWidth={2} />
      {showLabel && <span style={{ fontSize: size - 2, fontWeight: 500 }}>{config.label}</span>}
    </span>
  )
}

export function LogisticsIcon({ type, size = 14 }) {
  const config = LOGISTICS_ICONS[type]
  if (!config) return <Info size={size} color="#9ca3af" />
  const Icon = config.icon
  return <Icon size={size} strokeWidth={2} color={config.color} />
}

export function getCategoryColor(category) {
  return CATEGORY_ICONS[category]?.color || '#9ca3af'
}

export function getCategoryBg(category) {
  const color = getCategoryColor(category)
  return color + '18'  // ~10% opacity
}

export function getLogisticsLabel(type) {
  return LOGISTICS_ICONS[type]?.label || ''
}

// Re-export commonly used icons
export {
  MapPin, Clock, AlertTriangle, User, ChevronRight, Calendar,
  Car, Eye, Plane, Flag, Navigation, Music, Star,
}
