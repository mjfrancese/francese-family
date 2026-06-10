import { colors, fonts } from '../theme'
import StatusBadge from './StatusBadge'
import DetailSection from './DetailSection'
import DayPlan from './DayPlan'
import { renderBullets } from './Bullet'
import { normSlot, whoOf } from '../utils/selectionUtils'
import { ChevronRight } from 'lucide-react'

export default function DayCard({ day, dayNum, month, title, events = [], details = [], expanded, onToggle, isToday = false, currentEventIndex = -1, plan = null, daySelections = {}, travelers = [], onToggleOption, onToggleTraveler }) {
  const hasDetails = details && details.length > 0
  const hasPlan = !!(plan && plan.slots && plan.slots.length > 0)
  const hasExpandable = hasDetails || hasPlan
  const travLabel = (id) => (travelers.find(t => t.id === id) || {}).label || id
  // For plan days, build the collapsed preview from the plan itself so fixed
  // (booked) items sit in line at their time and choices show their status (and
  // who, when split) — all in chronological order. When expanded, DayPlan
  // renders the full flow, so the header preview steps aside to avoid dupes.
  const planPreview = hasPlan
    ? plan.slots.map(s => {
        if (s.fixed) {
          return { time: s.time, text: s.label, status: s.status, statusLabel: s.statusLabel }
        }
        const map = normSlot(daySelections[s.id])
        const chosen = s.options.filter(o => o.id in map)
        if (chosen.length === 0) return { time: s.time, text: `${s.title} — tap to choose` }
        const parts = chosen.map(o => {
          const who = whoOf(map[o.id]).map(travLabel)
          return o.label + (who.length ? ` (${who.join(', ')})` : '')
        })
        return { time: s.time, text: `${s.title}: ${parts.join(' · ')}`, status: 'confirmed' }
      })
    : []
  const headerItems = hasPlan ? (expanded ? events : [...planPreview, ...events]) : events

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${isToday ? colors.accent : expanded ? colors.cardBorderActive : colors.cardBorder}`,
      borderLeft: isToday ? `3px solid ${colors.accent}` : undefined,
      borderRadius: 8,
      marginBottom: 8,
      transition: 'border-color 0.15s ease',
    }}>
      {/* Header row */}
      <div
        onClick={hasExpandable ? onToggle : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          cursor: hasExpandable ? 'pointer' : 'default',
          transition: 'background 0.15s ease',
        }}
        onMouseOver={e => { if (hasExpandable) e.currentTarget.style.background = colors.cardHover }}
        onMouseOut={e => { if (hasExpandable) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Day badge */}
        <div style={{
          minWidth: 52,
          textAlign: 'center',
          padding: '8px 4px',
          background: '#1a1a2e',
          borderRadius: 6,
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.textDim, textTransform: 'uppercase' }}>
            {day}
          </div>
          <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>
            {dayNum}
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.textDim, textTransform: 'uppercase' }}>
            {month}
          </div>
        </div>

        {/* Title + events preview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {isToday && (
              <span style={{
                fontFamily: fonts.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                color: '#fff',
                background: colors.accent,
                borderRadius: 4,
                padding: '1px 6px',
                flexShrink: 0,
              }}>
                TODAY
              </span>
            )}
            <span>{title}</span>
            {hasPlan && (
              <span style={{
                fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                color: colors.bullet.tip, border: '1px solid #2d6b45', borderRadius: 4,
                padding: '1px 6px', flexShrink: 0,
              }}>
                BUILD YOUR OWN
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {headerItems.slice(0, expanded ? headerItems.length : 5).map((evt, i) => {
              const isCurrent = !hasPlan && i === currentEventIndex
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  color: isCurrent ? colors.text : colors.textMuted,
                  background: isCurrent ? 'rgba(74,144,217,0.10)' : 'transparent',
                  borderRadius: isCurrent ? 4 : 0,
                  padding: isCurrent ? '2px 6px' : 0,
                  margin: isCurrent ? '0 -6px' : 0,
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                  {evt.time && (
                    <span style={{ fontFamily: fonts.mono, fontSize: 10, color: isCurrent ? colors.accent : colors.textDim, minWidth: 56, flexShrink: 0 }}>
                      {evt.time}
                    </span>
                  )}
                  <span style={{ flex: 1, minWidth: 0 }}>{evt.text}</span>
                  {evt.status && <StatusBadge status={evt.status} label={evt.statusLabel} />}
                </div>
              )
            })}
            {!expanded && headerItems.length > 5 && (
              <div style={{ fontSize: 10, color: colors.textDark }}>+{headerItems.length - 5} more...</div>
            )}
          </div>
        </div>

        {/* Chevron */}
        {hasExpandable && (
          <ChevronRight
            size={16}
            color={colors.textDim}
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Expanded: Build-Your-Own plan + detail sections */}
      {expanded && hasExpandable && (
        <div style={{
          padding: '0 16px 16px 82px',
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: 16,
          background: 'linear-gradient(180deg, #12121f 0%, transparent 100%)',
        }}>
          {hasPlan && (
            <DayPlan
              plan={plan}
              daySelections={daySelections}
              travelers={travelers}
              onToggleOption={(slotId, optId) => onToggleOption && onToggleOption(slotId, optId)}
              onToggleTraveler={(slotId, optId, travId) => onToggleTraveler && onToggleTraveler(slotId, optId, travId)}
            />
          )}
          {details.map((section, i) => (
            <DetailSection key={i} icon={section.icon} title={section.title} color={section.color}>
              {renderBullets(section.items || section.bullets)}
            </DetailSection>
          ))}
        </div>
      )}
    </div>
  )
}
