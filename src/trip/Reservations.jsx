import BookingCard from '../components/BookingCard'
import SectionHeader from '../components/SectionHeader'
import { colors } from '../theme'
import { Plane, Train, Bus, Car, Hotel, Theater, FerrisWheel, Utensils } from 'lucide-react'

const categoryOrder = ['flight', 'train', 'transport', 'car', 'hotel', 'show', 'attraction', 'dining']
const categoryLabels = {
  flight: { label: 'Flights', Icon: Plane },
  train: { label: 'Trains', Icon: Train },
  transport: { label: 'Transport', Icon: Bus },
  car: { label: 'Car Rental', Icon: Car },
  hotel: { label: 'Hotels', Icon: Hotel },
  show: { label: 'Shows & Events', Icon: Theater },
  attraction: { label: 'Attractions', Icon: FerrisWheel },
  dining: { label: 'Dining', Icon: Utensils },
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
        const config = categoryLabels[cat] || { label: cat }
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <SectionHeader Icon={config.Icon}>{config.label}</SectionHeader>
            {groups[cat].map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )
      })}
    </div>
  )
}
