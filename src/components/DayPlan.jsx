import { colors, fonts } from '../theme'
import { renderBullets } from './Bullet'
import { Check } from 'lucide-react'

// Renders a day's "Build-Your-Own" plan: a set of choice slots, each with
// toggleable options. Selecting an option reveals ITS OWN travel + notes
// (gems/pitfalls), so the plan reshapes as you pick. Selections are passed in
// (shared/sticky via useSelections) and changed through onSelect(slotId, optId|null).
//
// Schema (on a timeline day as `plan`):
//   { intro?: string, slots: [ {
//       id, title, time?,
//       options: [ {
//         id, label, icon?, for?, tier?: 'gem', summary?, cost?, book?,
//         travel?: html, notes?: [{type,text}], then?: string
//       } ]
//   } ] }
export default function DayPlan({ plan, daySelections = {}, onSelect }) {
  if (!plan || !plan.slots || plan.slots.length === 0) return null

  return (
    <div style={{ marginBottom: 4 }}>
      {plan.intro && (
        <div style={{ fontSize: 11.5, color: colors.textDim, marginBottom: 14, lineHeight: 1.5 }}>
          {plan.intro}
        </div>
      )}

      {plan.slots.map((slot, si) => {
        // Fixed entries (booked, set-time certainties) render in line at their
        // time with no options — just a confirmed timeline card.
        if (slot.fixed) {
          return (
            <div key={slot.id} style={{ marginBottom: 18 }}>
              {si > 0 && <div style={connector} />}
              <FixedEntry slot={slot} />
            </div>
          )
        }
        const selectedId = daySelections[slot.id] || null
        const selected = slot.options.find((o) => o.id === selectedId) || null
        return (
          <div key={slot.id} style={{ marginBottom: 18 }}>
            {/* Connector line down from the previous slot */}
            {si > 0 && <div style={connector} />}

            {/* Slot header */}
            <div style={slotHeader}>
              {slot.time && <span style={timeChip}>{slot.time}</span>}
              <span style={{ flex: 1 }}>{slot.title}</span>
              {selected && (
                <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.bullet.tip }}>
                  ✓ CHOSEN
                </span>
              )}
            </div>

            {/* Option chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {slot.options.map((opt) => {
                const isSel = opt.id === selectedId
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelect(slot.id, isSel ? null : opt.id)}
                    style={chipStyle(isSel, opt.tier === 'gem')}
                    title={opt.tier === 'gem' ? 'A whole-family highlight' : undefined}
                  >
                    {isSel && <Check size={11} strokeWidth={3} style={{ marginRight: 4, verticalAlign: -1 }} />}
                    {opt.tier === 'gem' && !isSel ? '🦢 ' : ''}
                    {opt.icon ? `${opt.icon} ` : ''}
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Selected option detail — the adaptive travel + notes */}
            {selected ? (
              <OptionDetail opt={selected} />
            ) : (
              <div style={{ fontSize: 11, color: colors.textDark, fontStyle: 'italic', marginTop: 8 }}>
                Tap an option to drop it into the plan — it sticks and syncs for everyone.
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function OptionDetail({ opt }) {
  const hasMeta = opt.for || opt.cost || opt.book
  return (
    <div style={detailCard}>
      {opt.summary && (
        <div style={{ fontSize: 12.5, color: colors.text, lineHeight: 1.5, marginBottom: hasMeta || opt.travel || opt.notes ? 8 : 0 }}>
          {opt.summary}
        </div>
      )}

      {hasMeta && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: opt.travel || opt.notes ? 8 : 0 }}>
          {opt.for && <span style={metaPill}>👥 {opt.for}</span>}
          {opt.cost && <span style={metaPill}>💷 {opt.cost}</span>}
          {opt.book && <span style={{ ...metaPill, color: colors.bullet.warn, borderColor: '#6b5a2d', background: '#241d10' }}>📌 {opt.book}</span>}
        </div>
      )}

      {opt.travel && (
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: colors.textMuted, marginBottom: opt.notes ? 6 : 0, lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0 }}>🚇</span>
          <span dangerouslySetInnerHTML={{ __html: opt.travel }} />
        </div>
      )}

      {opt.notes && renderBullets(opt.notes)}

      {opt.then && (
        <div style={{ fontSize: 11, color: colors.textDim, marginTop: 8, borderTop: `1px solid ${colors.divider}`, paddingTop: 6 }}>
          → {opt.then}
        </div>
      )}
    </div>
  )
}

function FixedEntry({ slot }) {
  const hasBody = slot.summary || slot.travel || slot.notes
  return (
    <div>
      <div style={fixedRow}>
        {slot.time && <span style={timeChip}>{slot.time}</span>}
        <span style={{ flex: 1, fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.text }}>
          {slot.label}
        </span>
        <span style={bookedBadge}>{slot.statusLabel || 'BOOKED'}</span>
      </div>
      {hasBody && (
        <div style={{ ...detailCard, background: 'rgba(92,232,146,0.05)', borderColor: '#2d6b45' }}>
          {slot.summary && (
            <div style={{ fontSize: 12.5, color: colors.text, lineHeight: 1.5, marginBottom: slot.travel || slot.notes ? 8 : 0 }}>
              {slot.summary}
            </div>
          )}
          {slot.travel && (
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: colors.textMuted, marginBottom: slot.notes ? 6 : 0, lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>🚇</span>
              <span dangerouslySetInnerHTML={{ __html: slot.travel }} />
            </div>
          )}
          {slot.notes && renderBullets(slot.notes)}
        </div>
      )}
    </div>
  )
}

const fixedRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 11px',
  background: 'rgba(92,232,146,0.07)',
  border: '1px solid #2d6b45',
  borderRadius: 8,
}

const bookedBadge = {
  fontFamily: fonts.mono,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  color: colors.bullet.tip,
  flexShrink: 0,
}

const slotHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: fonts.heading,
  fontSize: 13,
  fontWeight: 600,
  color: colors.text,
}

const timeChip = {
  fontFamily: fonts.mono,
  fontSize: 10,
  color: colors.accent,
  border: `1px solid ${colors.cardBorderActive}`,
  borderRadius: 4,
  padding: '1px 6px',
  flexShrink: 0,
}

const connector = {
  width: 2,
  height: 10,
  background: colors.cardBorder,
  marginLeft: 10,
  marginBottom: 8,
}

function chipStyle(selected, gem) {
  return {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: selected ? 600 : 400,
    padding: '6px 11px',
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    color: selected ? '#fff' : colors.textMuted,
    background: selected ? colors.accent : 'transparent',
    border: `1px solid ${selected ? colors.accent : gem ? '#3a5a3a' : colors.border}`,
  }
}

const detailCard = {
  marginTop: 10,
  padding: '12px 14px',
  background: 'rgba(74,144,217,0.06)',
  border: `1px solid ${colors.cardBorderActive}`,
  borderRadius: 8,
}

const metaPill = {
  fontFamily: fonts.mono,
  fontSize: 10,
  color: colors.textDim,
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  padding: '2px 7px',
}
