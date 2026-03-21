import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTripData } from '../hooks/useTripData'
import { useChecklist } from '../hooks/useChecklist'
import { useAccess } from '../hooks/useAccess'
import { colors, fonts, styles } from '../theme'
import DayByDay from './DayByDay'
import Reservations from './Reservations'
import Budget from './Budget'
import Checklist from './Checklist'
import SharePanel from '../components/SharePanel'

const TABS = [
  { key: 'daybyday', label: 'Day by Day', icon: '📅' },
  { key: 'reservations', label: 'Reservations', icon: '📋' },
  { key: 'budget', label: 'Budget', icon: '💰' },
  { key: 'todo', label: 'To Do', icon: '✅' },
]

export default function TripDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { meta, timeline, bookings, budget, loading: dataLoading } = useTripData(slug)
  const { items: checklistItems, loading: checkLoading, toggle } = useChecklist(slug)
  const { hasAccess, isOwner, accessList, loading: accessLoading, addAccess, removeAccess } = useAccess(slug, user)
  const [activeTab, setActiveTab] = useState('daybyday')
  const [showShare, setShowShare] = useState(false)

  const loading = dataLoading || checkLoading || accessLoading

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.textDim, fontSize: 13 }}>Loading trip...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: colors.textDim }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>You don't have access to this trip.</div>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '8px 20px', background: colors.accent, border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13 }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!meta) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.textDim }}>Trip not found.</div>
      </div>
    )
  }

  // Determine available tabs (hide tabs with no data)
  const availableTabs = TABS.filter(tab => {
    if (tab.key === 'daybyday') return timeline.length > 0
    if (tab.key === 'reservations') return bookings.length > 0
    if (tab.key === 'budget') return budget !== null
    if (tab.key === 'todo') return true // always show checklist
    return true
  })

  // Default to first available tab
  if (!availableTabs.find(t => t.key === activeTab) && availableTabs.length > 0) {
    setActiveTab(availableTabs[0].key)
  }

  const doneCount = checklistItems.filter(i => i.done).length

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>
      {/* Header */}
      <header style={{
        padding: '24px 24px 0',
        textAlign: 'center',
        borderBottom: `1px solid ${colors.divider}`,
      }}>
        {/* Nav bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textDim,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: fonts.body,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Home
          </button>
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              style={{
                padding: '6px 14px',
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.textMuted,
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: fonts.body,
              }}
            >
              Share
            </button>
          )}
        </div>

        {/* Trip title */}
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 32 }}>{meta.emoji || '✈'}</span>
        </div>
        <h1 style={{
          fontFamily: fonts.heading,
          fontSize: 28,
          fontWeight: 700,
          color: colors.text,
          letterSpacing: 0.5,
          marginBottom: 4,
        }}>
          {meta.title}
        </h1>
        <div style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: 2,
          color: colors.textDim,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          {meta.dates}
        </div>
        {meta.travelers && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {meta.travelers.map(t => (
              <span key={t} style={{
                padding: '3px 10px',
                background: '#1a1a2e',
                border: `1px solid ${colors.divider}`,
                borderRadius: 12,
                fontSize: 11,
                color: colors.textMuted,
              }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div style={styles.tabBar}>
          {availableTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={styles.tab(activeTab === tab.key)}
            >
              {tab.label}
              {tab.key === 'todo' && checklistItems.length > 0 && (
                <span style={{
                  marginLeft: 6,
                  fontSize: 10,
                  color: colors.textDark,
                }}>
                  {doneCount}/{checklistItems.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <div style={{ padding: '20px 24px 48px', maxWidth: 800, margin: '0 auto' }}>
        {activeTab === 'daybyday' && <DayByDay timeline={timeline} />}
        {activeTab === 'reservations' && <Reservations bookings={bookings} />}
        {activeTab === 'budget' && <Budget budget={budget} />}
        {activeTab === 'todo' && <Checklist items={checklistItems} toggle={toggle} />}
      </div>

      {showShare && (
        <SharePanel
          accessList={accessList}
          onAdd={addAccess}
          onRemove={removeAccess}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
