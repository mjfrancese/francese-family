import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { colors, fonts } from '../theme'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function WorldMap({ trips }) {
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState(null)
  const [zoom, setZoom] = useState(1)

  const handleMoveEnd = useCallback((position) => {
    setZoom(position.zoom)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <ComposableMap
        projectionConfig={{ scale: 147, center: [10, 20] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup
          onMoveEnd={handleMoveEnd}
          translateExtent={zoom <= 1 ? [[0, 0], [800, 600]] : undefined}
          filterZoomEvent={e => {
            // Allow zoom (wheel/pinch) always, but only allow pan when zoomed in
            if (e.type === 'wheel' || e.type === 'touchmove') return true
            // Block drag/pan at zoom level 1
            return zoom > 1
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rpiKey || geo.properties.name}
                  geography={geo}
                  fill="#1a1a2e"
                  stroke="#2a2a3a"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#222240', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {trips.map((trip) => {
            if (!trip.coordinates) return null
            const coords = [trip.coordinates.lng, trip.coordinates.lat]
            return (
              <Marker
                key={trip.slug}
                coordinates={coords}
                onClick={() => navigate(`/trip/${trip.slug}`)}
                onMouseEnter={() => setTooltip(trip)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={6}
                  fill={trip.color || colors.accent}
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={0.9}
                />
                <circle
                  r={10}
                  fill={trip.color || colors.accent}
                  opacity={0.2}
                />
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: colors.card,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 8,
          padding: '10px 16px',
          pointerEvents: 'none',
          zIndex: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
            {tooltip.title}
          </div>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono }}>
            {tooltip.dates}
          </div>
        </div>
      )}
    </div>
  )
}
