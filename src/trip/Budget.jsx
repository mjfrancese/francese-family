import { colors, fonts } from '../theme'
import SectionHeader from '../components/SectionHeader'

function BudgetRow({ item, cost, note }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${colors.divider}`,
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: colors.text, flex: 1 }}>{item}</span>
      <span style={{
        fontFamily: fonts.mono,
        fontSize: 12,
        color: colors.text,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {cost}
      </span>
      {note && (
        <span style={{ fontSize: 10, color: colors.textDark, maxWidth: 120, textAlign: 'right' }}>
          {note}
        </span>
      )}
    </div>
  )
}

function TotalRow({ label, amount }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderTop: `2px solid ${colors.border}`,
      marginTop: 4,
    }}>
      <span style={{
        fontFamily: fonts.heading,
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: fonts.mono,
        fontSize: 16,
        fontWeight: 700,
        color: '#5ce892',
      }}>
        {amount}
      </span>
    </div>
  )
}

export default function Budget({ budget }) {
  if (!budget) {
    return <div style={{ color: colors.textDim, textAlign: 'center', padding: 40 }}>No budget data yet.</div>
  }

  return (
    <div>
      {/* Confirmed */}
      {budget.confirmed && budget.confirmed.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader icon="✅">Confirmed Costs</SectionHeader>
          <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 8, padding: 16 }}>
            {budget.confirmed.map((row, i) => (
              <BudgetRow key={i} item={row.item} cost={row.cost} note={row.note} />
            ))}
            {budget.confirmedTotal && <TotalRow label="Confirmed Total" amount={budget.confirmedTotal} />}
          </div>
        </div>
      )}

      {/* Estimated */}
      {budget.estimated && budget.estimated.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader icon="📊">Estimated Costs</SectionHeader>
          <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 8, padding: 16 }}>
            {budget.estimated.map((row, i) => (
              <BudgetRow key={i} item={row.item} cost={row.cost} note={row.note} />
            ))}
            {budget.estimatedTotal && <TotalRow label="Estimated Total" amount={budget.estimatedTotal} />}
          </div>
        </div>
      )}

      {/* Savings note */}
      {budget.savingsNote && (
        <div style={{
          background: 'rgba(92, 232, 146, 0.06)',
          border: '1px solid rgba(92, 232, 146, 0.2)',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: colors.textDim, marginBottom: 4 }}>Points & Credits</div>
          <div style={{ fontSize: 13, color: '#5ce892', fontWeight: 600 }}>{budget.savingsNote}</div>
        </div>
      )}
    </div>
  )
}
