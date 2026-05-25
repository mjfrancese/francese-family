import { useEffect } from 'react'
import { useLoops } from '../hooks/useLoops'
import { useSequences } from '../hooks/useSequences'
import { useFamilyStatus } from '../hooks/useFamilyStatus'
import { colors, fonts } from '../theme'
import FamilyStatusPill from '../components/FamilyStatusPill'
import OpenLoopsBoard from '../components/OpenLoopsBoard'
import SequenceTracker from '../components/SequenceTracker'

function Clock() {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 28, color: colors.text, fontWeight: 300 }}>{time}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, letterSpacing: 1 }}>{date}</div>
    </div>
  )
}

export default function Ambient() {
  const { openLoops, loading: loopsLoading } = useLoops()
  const { list: sequences, loading: seqLoading } = useSequences()
  const { status, loading: statusLoading } = useFamilyStatus()

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => window.location.reload(), 60000)
    return () => clearInterval(id)
  }, [])

  // Top 8 loops only
  const topLoops = openLoops.slice(0, 8)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080810',
      fontFamily: fonts.body,
      padding: '28px 36px',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
        borderBottom: `1px solid #1a1a2a`,
        paddingBottom: 16,
      }}>
        <div>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 22,
            fontWeight: 700,
            color: colors.text,
          }}>
            Francese Family
          </div>
          {!statusLoading && status && (
            <FamilyStatusPill overall={status.overall} compact />
          )}
        </div>
        <Clock />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
        <div>
          {!loopsLoading && (
            <OpenLoopsBoard
              loops={topLoops}
              onMarkDone={() => {}}
              onMarkOpen={() => {}}
            />
          )}
        </div>
        <div>
          {!seqLoading && (
            <SequenceTracker sequences={sequences} />
          )}
          {!statusLoading && status?.areas && (
            <div style={{ marginTop: 20 }}>
              <FamilyStatusPill
                overall={status.overall}
                areas={status.areas}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 12,
        right: 20,
        fontSize: 9,
        color: '#2a2a3a',
        fontFamily: fonts.mono,
        letterSpacing: 1,
      }}>
        francese.family · ambient · auto-refresh 60s
      </div>
    </div>
  )
}
