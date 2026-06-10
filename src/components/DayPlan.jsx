import { colors, fonts } from '../theme'
import { renderBullets } from './Bullet'
import { normSlot, whoOf } from '../utils/selectionUtils'
import { Check } from 'lucide-react'

// Renders a day's "Build-Your-Own" plan: fixed (booked) entries in line at
// their time, plus choice slots. Options are MULTI-select — pick two+ and the
// group "splits", revealing per-option "who?" chips (the trip's travelers).
// The who-UI only appears when split, so the together-case stays one tap.
export default function DayPlan({ plan, daySelections = {}, travelers = [], onToggleOption, onToggleTraveler }) {
  if (!plan || !plan.slots || plan.slots.length === 0) return null

  return (
    <div style={{ marginBottom: 4 }}>
      {plan.intro && <div style={introStyle}>{plan.intro}</div>}

      {plan.slots.map((slot, si) => {
        if (slot.fixed) {
          return (
            <div key={slot.id} style={{ marginBottom: 18 }}>
              {si > 0 && <div style={connector} />}
              <FixedEntry slot={slot} />
            </div>
          )
        }

        const map = normSlot(daySelections[slot.id])
        const selectedIds = slot.options.filter((o) => o.id in map).map((o) => o.id)
        const isSplit = selectedIds.length >= 2

        return (
          <div key={slot.id} style={{ marginBottom: 18 }}>
            {si > 0 && <div style={connector} />}

            <div style={slotHeader}>
              {slot.time && <span style={timeChip}>{slot.time}</span>}
              <span style={{ flex: 1 }}>{slot.title}</span>
              {isSplit && <span style={splitBadge}>SPLIT</span>}
              {selectedIds.length === 1 && <span style={chosenBadge}>✓ CHOSEN</span>}
            </div>

            {/* Option chips (multi-select) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {slot.options.map((opt) => {
                const isSel = opt.id in map
                return (
                  <button
                    key={opt.id}
                    onClick={() => onToggleOption(slot.id, opt.id)}
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

            {selectedIds.length === 0 && (
              <div style={hintStyle}>
                Tap an option to drop it into the plan — pick a second one if the group splits up. Syncs for everyone.
              </div>
            )}

            {/* Detail for each chosen option, + who-chips when split */}
            {selectedIds.map((id) => {
              const opt = slot.options.find((o) => o.id === id)
              if (!opt) return null
              const who = whoOf(map[id])
              return (
                <div key={id}>
                  <OptionDetail opt={opt} showHeader={selectedIds.length > 1} />
                  {isSplit && (
                    <div style={whoRow}>
                      <span style={whoLabel}>👥 Who?</span>
                      {travelers.map((t) => {
                        const on = who.includes(t.id)
                        return (
                          <button key={t.id} onClick={() => onToggleTraveler(slot.id, id, t.id)} style={whoChip(on)}>
                            {on && <Check size={9} strokeWidth={3} style={{ marginRight: 3, verticalAlign: -1 }} />}
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {isSplit && <div style={hintStyle}>Group split — tap names to set who's on each.</div>}
          </div>
        )
      })}
    </div>
  )
}

function OptionDetail({ opt, showHeader }) {
  const hasMeta = opt.for || opt.cost || opt.book
  return (
    <div style={detailCard}>
      {showHeader && (
        <div style={{ fontFamily: fonts.heading, fontSize: 12.5, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
          {opt.icon ? `${opt.icon} ` : ''}{opt.label}
        </div>
      )}
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

const introStyle = { fontSize: 11.5, color: colors.textDim, marginBottom: 14, lineHeight: 1.5 }
const hintStyle = { fontSize: 11, color: colors.textDark, fontStyle: 'italic', marginTop: 8 }

const slotHeader = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.text,
}
const timeChip = {
  fontFamily: fonts.mono, fontSize: 10, color: colors.accent,
  border: `1px solid ${colors.cardBorderActive}`, borderRadius: 4, padding: '1px 6px', flexShrink: 0,
}
const chosenBadge = { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.bullet.tip, flexShrink: 0 }
const splitBadge = {
  fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#e8a04a',
  border: '1px solid #6b5a2d', borderRadius: 4, padding: '1px 6px', flexShrink: 0,
}
const connector = { width: 2, height: 10, background: colors.cardBorder, marginLeft: 10, marginBottom: 8 }

function chipStyle(selected, gem) {
  return {
    fontFamily: fonts.body, fontSize: 12, fontWeight: selected ? 600 : 400,
    padding: '6px 11px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.12s ease',
    color: selected ? '#fff' : colors.textMuted,
    background: selected ? colors.accent : 'transparent',
    border: `1px solid ${selected ? colors.accent : gem ? '#3a5a3a' : colors.border}`,
  }
}

const whoRow = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 6, marginLeft: 2 }
const whoLabel = { fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, marginRight: 2 }
function whoChip(on) {
  return {
    fontFamily: fonts.body, fontSize: 11, padding: '2px 9px', borderRadius: 12, cursor: 'pointer',
    color: on ? '#fff' : colors.textMuted,
    background: on ? '#2d6b45' : 'transparent',
    border: `1px solid ${on ? '#2d6b45' : colors.border}`,
  }
}

const detailCard = {
  marginTop: 10, padding: '12px 14px',
  background: 'rgba(74,144,217,0.06)', border: `1px solid ${colors.cardBorderActive}`, borderRadius: 8,
}
const metaPill = {
  fontFamily: fonts.mono, fontSize: 10, color: colors.textDim,
  border: `1px solid ${colors.border}`, borderRadius: 4, padding: '2px 7px',
}
const fixedRow = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px',
  background: 'rgba(92,232,146,0.07)', border: '1px solid #2d6b45', borderRadius: 8,
}
const bookedBadge = { fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: colors.bullet.tip, flexShrink: 0 }
