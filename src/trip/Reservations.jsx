import BookingCard from '../components/BookingCard'
import SectionHeader from '../components/SectionHeader'
import { colors } from '../theme'

const categoryOrder = ['flight', 'train', 'transport', 'car', 'hotel', 'show', 'attraction', 'dining']
const categoryLabels = {
  flight: { label: 'Flights', icon: '✈' },
  train: { label: 'Trains', icon: '🚄' },
  transport: { label: 'Transport', icon: '🚌' },
  car: { label: 'Car Rental', icon: '🚗' },
  hotel: { label: 'Hotels', icon: '🏨' },
  show: { label: 'Shows & Events', icon: '🎭' },
  attraction: { label: 'Attractions', icon: '🎡' },
  dining: { label: 'Dining', icon: '🍽' },
}

export default function Reservations({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No bookings yet.</div>
  }

  // Group by category
  const groups = {}
  for (const b of bookings) {
    const cat = b.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(b)
  }

  const sortedCategories = Object.keys(groups).sort((a, b) => {
    return (categoryOrder.indexOf(a) ?? 99) - (categoryOrder.indexOf(b) ?? 99)
  })

  return (
    <div>
      {sortedCategories.map(cat => {
        const config = categoryLabels[cat] || { label: cat, icon: '📋' }
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <SectionHeader icon={config.icon}>{config.label}</SectionHeader>
            {groups[cat].map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )
      })}
    </div>
  )
}
