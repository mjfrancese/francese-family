import { useState } from 'react'
import { colors, fonts } from '../theme'
import SectionHeader from '../components/SectionHeader'
import { User, ShieldCheck, Award, ChevronRight } from 'lucide-react'

function formatExpires(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function TravelerCard({ traveler }) {
  const [expanded, setExpanded] = useState(false)
  const expires = formatExpires(traveler.trustedTraveler?.globalEntryExpires)
  const hasGE = !!traveler.trustedTraveler?.ktn
  const loyaltyEntries = traveler.loyalty
    ? Object.entries(traveler.loyalty).filter(([, v]) => v)
    : []

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${expanded ? colors.cardBorderActive : colors.cardBorder}`,
      borderRadius: 8,
      marginBottom: 8,
      transition: 'border-color 0.15s ease',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          cursor: 'pointer',
        }}
        onMouseOver={e => e.currentTarget.style.background = colors.cardHover}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: '#1a1a2e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <User size={18} color={colors.textMuted} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 2,
          }}>
            {traveler.name}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            {hasGE ? 'Global Entry · TSA PreCheck' : 'No Trusted Traveler on file'}
            {loyaltyEntries.length > 0 && ` · ${loyaltyEntries.length} loyalty program${loyaltyEntries.length === 1 ? '' : 's'}`}
          </div>
        </div>
        {hasGE && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            background: colors.status.confirmed.bg,
            border: `1px solid ${colors.status.confirmed.border}`,
            borderRadius: 4,
            fontSize: 10,
            color: colors.status.confirmed.color,
            fontFamily: fonts.mono,
            letterSpacing: 0.5,
          }}>
            <ShieldCheck size={10} />
            GE
          </div>
        )}
        <ChevronRight
          size={16}
          color={colors.textDim}
          style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        />
      </div>

      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: 12,
        }}>
          {hasGE && (
            <div style={{
              marginBottom: 12,
              padding: 12,
              background: 'rgba(45, 107, 69, 0.12)',
              border: `1px solid ${colors.status.confirmed.border}`,
              borderRadius: 6,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 6,
              }}>
                <ShieldCheck size={12} color={colors.status.confirmed.color} />
                <span style={{
                  fontSize: 10,
                  color: colors.status.confirmed.color,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontWeight: 600,
                }}>
                  Global Entry · KTN
                </span>
              </div>
              <div style={{
                fontFamily: fonts.mono,
                fontSize: 14,
                color: colors.text,
                letterSpacing: 0.5,
              }}>
                {traveler.trustedTraveler.ktn}
              </div>
              {expires && (
                <div style={{ fontSize: 11, color: colors.textDim, marginTop: 4 }}>
                  Expires {expires}
                </div>
              )}
              <div style={{ fontSize: 10, color: colors.textDim, marginTop: 6, lineHeight: 1.5 }}>
                Use as Known Traveler Number on every flight booking. Includes TSA PreCheck.
              </div>
            </div>
          )}

          {loyaltyEntries.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}>
                <Award size={12} color={colors.textDim} />
                <span style={{
                  fontSize: 10,
                  color: colors.textDim,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontWeight: 600,
                }}>
                  Loyalty Programs
                </span>
              </div>
              {loyaltyEntries.map(([program, num]) => (
                <div key={program} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: `1px solid ${colors.divider}`,
                  gap: 12,
                }}>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>{program}</span>
                  <span style={{
                    fontFamily: fonts.mono,
                    fontSize: 12,
                    color: colors.text,
                    textAlign: 'right',
                    wordBreak: 'break-all',
                  }}>
                    {num}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TravelProfile({ travelers }) {
  const list = travelers
    ? Object.entries(travelers)
        .map(([id, t]) => ({ id, ...t }))
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    : []

  if (list.length === 0) {
    return (
      <div style={{ color: colors.textDim, textAlign: 'center', padding: 40, fontSize: 13 }}>
        No traveler profiles configured yet.
      </div>
    )
  }

  return (
    <div>
      <SectionHeader Icon={User}>Traveler Profiles</SectionHeader>
      <div style={{
        fontSize: 11,
        color: colors.textDim,
        lineHeight: 1.6,
        marginBottom: 14,
        padding: '10px 12px',
        background: '#1a1a2a',
        borderRadius: 6,
      }}>
        Known Traveler Numbers, Global Entry expirations, and frequent flyer accounts for everyone on this trip. Tap a traveler to expand.
      </div>
      {list.map(t => <TravelerCard key={t.id} traveler={t} />)}
    </div>
  )
}
