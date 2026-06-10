import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTripData } from '../hooks/useTripData'
import { useChecklist } from '../hooks/useChecklist'
import { useSelections } from '../hooks/useSelections'
import { useAccess } from '../hooks/useAccess'
import { colors, fonts, styles } from '../theme'
import { Calendar, ClipboardList, DollarSign, CheckSquare, Lock, ArrowLeft, Settings, Plane, ShieldCheck } from 'lucide-react'
import DayByDay from './DayByDay'
import Reservations from './Reservations'
import Budget from './Budget'
import Checklist from './Checklist'
import TravelProfile from './TravelProfile'
import SharePanel from '../components/SharePanel'
import TripIcon from '../components/TripIcon'
import TripSettings from '../components/TripSettings'
import FlightSearch from './FlightSearch'
import FlightPlanner from './FlightPlanner'

const TABS = [
  { key: 'daybyday', label: 'Day by Day', Icon: Calendar },
  { key: 'reservations', label: 'Reservations', Icon: ClipboardList },
  { key: 'budget', label: 'Budget', Icon: DollarSign },
  { key: 'todo', label: 'To Do', Icon: CheckSquare },
  { key: 'profile', label: 'Profile', Icon: ShieldCheck },
  { key: 'flights', label: 'Flights', Icon: Plane },
]

export default function TripDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { meta, timeline, bookings, budget, flightOptions, travelers, loading: dataLoading } = useTripData(slug)
  const { items: checklistItems, loading: checkLoading, toggle } = useChecklist(slug)
  const { selections, toggleOption, toggleTraveler } = useSelections(slug)
  const { hasAccess, isOwner, hideSurprise, accessList, loading: accessLoading, addAccess, removeAccess } = useAccess(slug, user)
  const [activeTab, setActiveTab] = useState('daybyday')
  const [showShare, setShowShare] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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
          <div style={{ marginBottom: 16 }}><Lock size={48} color={colors.textDim} /></div>
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

  // --- Surprise filtering ---------------------------------------------------
  // A "surprise-hidden" viewer (e.g. Kenna) must see ZERO of the tagged
  // content. We strip it at every level: whole days/bookings, individual
  // events/detail-items/plan options, and apply the meta.surprise overrides.
  const stripDay = (d) => ({
    ...d,
    events: (d.events || []).filter(e => !e.surprise),
    details: (d.details || [])
      .filter(s => !s.surprise)
      .map(s => ({ ...s, items: (s.items || []).filter(it => !it.surprise) }))
      .filter(s => (s.items || []).length > 0),
    plan: d.plan ? {
      ...d.plan,
      slots: (d.plan.slots || [])
        .filter(s => !s.surprise)
        .map(s => s.options ? { ...s, options: s.options.filter(o => !o.surprise) } : s),
    } : d.plan,
  })
  const viewMeta = hideSurprise && meta.surprise ? { ...meta, ...meta.surprise } : meta
  const viewTimeline = hideSurprise ? (timeline || []).filter(d => !d.surprise).map(stripDay) : timeline
  const viewBookings = hideSurprise ? (bookings || []).filter(b => !b.surprise) : bookings
  const viewChecklist = hideSurprise ? checklistItems.filter(i => !i.surprise) : checklistItems

  // Hide flights tab unless trip has flight options (planning mode).
  // Surprise-hidden viewers get only Day-by-Day + Reservations (everything
  // else risks leaking, so it's withheld entirely).
  const availableTabs = TABS.filter(t => {
    if (hideSurprise) return t.key === 'daybyday' || t.key === 'reservations'
    if (t.key === 'flights') return !!flightOptions
    if (t.key === 'profile') return !!travelers
    return true
  })

  const doneCount = viewChecklist.filter(i => i.done).length
  // Traveler presets for Build-Your-Own "who's doing what" when the group splits.
  const partyPresets = (meta.travelers || []).map(n => ({ id: n.toLowerCase().replace(/[^a-z0-9]/g, ''), label: n }))

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>
      {/* Header */}
      <header style={{
        padding: '14px 16px 0',
        textAlign: 'center',
        borderBottom: `1px solid ${colors.divider}`,
      }}>
        {/* Nav bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
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
            <ArrowLeft size={14} /> Home
          </button>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  padding: '6px 10px',
                  background: 'none',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Settings size={14} />
              </button>
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
            </div>
          )}
        </div>

        {/* Trip title */}
        <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
          <TripIcon icon={viewMeta.icon || viewMeta.emoji} size={32} tripColor={viewMeta.color} />
        </div>
        <h1 style={{
          fontFamily: fonts.heading,
          fontSize: 22,
          fontWeight: 700,
          color: colors.text,
          letterSpacing: 0.5,
          marginBottom: 4,
        }}>
          {viewMeta.title}
        </h1>
        <div style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: 2,
          color: colors.textDim,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          {viewMeta.dates}
        </div>
        {viewMeta.travelers && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {viewMeta.travelers.map(t => (
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
              <tab.Icon size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
              {tab.label}
              {tab.key === 'todo' && viewChecklist.length > 0 && (
                <span style={{
                  marginLeft: 6,
                  fontSize: 10,
                  color: colors.textDark,
                }}>
                  {doneCount}/{viewChecklist.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <div style={{ padding: '20px 24px 48px', maxWidth: 800, margin: '0 auto' }}>
        {activeTab === 'daybyday' && <DayByDay timeline={viewTimeline} meta={viewMeta} selections={selections} travelers={partyPresets} toggleOption={toggleOption} toggleTraveler={toggleTraveler} />}
        {activeTab === 'reservations' && <Reservations bookings={viewBookings} />}
        {activeTab === 'budget' && <Budget budget={budget} />}
        {activeTab === 'todo' && <Checklist items={viewChecklist} toggle={toggle} />}
        {activeTab === 'profile' && <TravelProfile travelers={travelers} />}
        {activeTab === 'flights' && (
          flightOptions
            ? <FlightPlanner flightOptions={flightOptions} />
            : <FlightSearch meta={meta} />
        )}
      </div>

      {showShare && (
        <SharePanel
          accessList={accessList}
          onAdd={addAccess}
          onRemove={removeAccess}
          onClose={() => setShowShare(false)}
        />
      )}

      {showSettings && (
        <TripSettings
          slug={slug}
          meta={meta}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
