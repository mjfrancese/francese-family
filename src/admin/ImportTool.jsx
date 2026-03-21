import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, set, get, update } from 'firebase/database'
import { db, sanitizeEmail, OWNER_EMAILS } from '../firebase'
import { colors, fonts, styles } from '../theme'

export default function ImportTool() {
  const navigate = useNavigate()
  const [json, setJson] = useState('')
  const [mode, setMode] = useState('full')
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [existingTrips, setExistingTrips] = useState([])
  const [targetSlug, setTargetSlug] = useState('')

  useEffect(() => {
    get(ref(db, 'trips')).then(snap => {
      const data = snap.val()
      if (data) setExistingTrips(Object.keys(data))
    })
  }, [])

  const handlePreview = () => {
    setError(null)
    setPreview(null)
    setSuccess(null)

    try {
      const parsed = JSON.parse(json)

      if (mode === 'full') {
        if (!parsed.slug) throw new Error('Missing "slug" field')
        if (!parsed.meta) throw new Error('Missing "meta" field')

        setPreview({
          slug: parsed.slug,
          meta: parsed.meta,
          bookings: parsed.bookings ? parsed.bookings.length : 0,
          timeline: parsed.timeline ? parsed.timeline.length : 0,
          checklist: parsed.checklist ? parsed.checklist.length : 0,
          hasBudget: !!parsed.budget,
          hasAccess: !!parsed.access,
          isNew: !existingTrips.includes(parsed.slug),
          data: parsed,
        })
        setTargetSlug(parsed.slug)
      } else {
        // Partial update
        const slug = targetSlug || parsed.slug
        if (!slug) throw new Error('Select or enter a target trip slug')

        const sections = []
        if (parsed.meta) sections.push('meta')
        if (parsed.bookings) sections.push(`bookings (${parsed.bookings.length})`)
        if (parsed.timeline) sections.push(`timeline (${parsed.timeline.length} days)`)
        if (parsed.budget) sections.push('budget')
        if (parsed.checklist) sections.push(`checklist (${parsed.checklist.length})`)

        setPreview({
          slug,
          sections,
          isNew: !existingTrips.includes(slug),
          data: parsed,
        })
      }
    } catch (e) {
      setError(e.message)
    }
  }

  const handleImport = async () => {
    if (!preview) return
    setImporting(true)
    setError(null)

    try {
      const data = preview.data
      const slug = preview.slug

      if (data.meta) {
        await set(ref(db, `trips/${slug}/meta`), data.meta)
      }

      if (data.access) {
        const accessData = {}
        for (const [email, val] of Object.entries(data.access)) {
          const sanitized = sanitizeEmail(email)
          accessData[sanitized] = val
        }
        await set(ref(db, `trips/${slug}/access`), accessData)
      } else if (preview.isNew) {
        // Seed default owners for new trips
        const accessData = {}
        for (const email of OWNER_EMAILS) {
          const sanitized = sanitizeEmail(email)
          const name = email.includes('mfrancese') ? 'Michael' : 'Meghan'
          accessData[sanitized] = { role: 'owner', name }
        }
        await set(ref(db, `trips/${slug}/access`), accessData)
      }

      if (data.bookings) {
        const bookingsData = {}
        data.bookings.forEach((b, i) => {
          const id = b.id || `booking_${i}`
          bookingsData[id] = { ...b, order: b.order ?? i }
          delete bookingsData[id].id
        })
        await set(ref(db, `trips/${slug}/bookings`), bookingsData)
      }

      if (data.timeline) {
        const timelineData = {}
        data.timeline.forEach((d, i) => {
          const id = d.id || `day_${i}`
          timelineData[id] = { ...d, order: d.order ?? i }
          delete timelineData[id].id
        })
        await set(ref(db, `trips/${slug}/timeline`), timelineData)
      }

      if (data.budget) {
        await set(ref(db, `trips/${slug}/budget`), data.budget)
      }

      if (data.checklist) {
        const checkData = {}
        data.checklist.forEach((c, i) => {
          const id = c.id || `check_${i}`
          checkData[id] = { ...c, order: c.order ?? i }
          delete checkData[id].id
        })
        await set(ref(db, `trips/${slug}/checklist`), checkData)
      }

      setSuccess(`Successfully imported trip "${slug}"!`)
      setPreview(null)
      setJson('')
      // Refresh existing trips
      const snap = await get(ref(db, 'trips'))
      if (snap.val()) setExistingTrips(Object.keys(snap.val()))
    } catch (e) {
      setError(`Import failed: ${e.message}`)
    }
    setImporting(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#1a1a2a',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.body,
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${colors.divider}`,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: colors.textDim, fontSize: 13, cursor: 'pointer', fontFamily: fonts.body }}
        >
          ← Home
        </button>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 600, color: colors.text }}>
          Import Trip Data
        </h1>
        <div />
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setMode('full')}
            style={{
              ...styles.tab(mode === 'full'),
              borderRadius: 6,
              border: `1px solid ${mode === 'full' ? colors.accent : colors.border}`,
            }}
          >
            Full Trip
          </button>
          <button
            onClick={() => setMode('partial')}
            style={{
              ...styles.tab(mode === 'partial'),
              borderRadius: 6,
              border: `1px solid ${mode === 'partial' ? colors.accent : colors.border}`,
            }}
          >
            Update Section
          </button>
        </div>

        {/* Target slug for partial updates */}
        {mode === 'partial' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: colors.textDim, marginBottom: 4, display: 'block' }}>Target Trip</label>
            <select
              value={targetSlug}
              onChange={e => setTargetSlug(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select existing trip...</option>
              {existingTrips.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* JSON textarea */}
        <textarea
          value={json}
          onChange={e => { setJson(e.target.value); setError(null); setSuccess(null) }}
          placeholder="Paste trip JSON here..."
          style={{
            ...inputStyle,
            minHeight: 300,
            fontFamily: fonts.mono,
            fontSize: 11,
            resize: 'vertical',
            marginBottom: 16,
          }}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={handlePreview}
            disabled={!json.trim()}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: `1px solid ${colors.accent}`,
              borderRadius: 6,
              color: colors.accent,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: !json.trim() ? 0.5 : 1,
            }}
          >
            Preview
          </button>
          {preview && (
            <button
              onClick={handleImport}
              disabled={importing}
              style={{
                padding: '12px 24px',
                background: colors.accent,
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: importing ? 'wait' : 'pointer',
                opacity: importing ? 0.5 : 1,
              }}
            >
              {importing ? 'Importing...' : 'Import to Firebase'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(232, 92, 92, 0.1)',
            border: '1px solid rgba(232, 92, 92, 0.3)',
            borderRadius: 8,
            color: '#e85c5c',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(92, 232, 146, 0.1)',
            border: '1px solid rgba(92, 232, 146, 0.3)',
            borderRadius: 8,
            color: '#5ce892',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {success}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 8,
            padding: 20,
          }}>
            <h3 style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginBottom: 12 }}>
              Preview
            </h3>
            <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.8 }}>
              <div><strong>Slug:</strong> <span style={{ fontFamily: fonts.mono, color: colors.accent }}>{preview.slug}</span></div>
              {preview.isNew && <div style={{ color: '#5ce892' }}>✨ New trip — will be created</div>}
              {!preview.isNew && <div style={{ color: '#e8c55c' }}>⚠ Existing trip — data will be overwritten</div>}
              {preview.meta && <div>📋 Meta: {preview.meta.title}</div>}
              {preview.bookings > 0 && <div>📝 {preview.bookings} bookings</div>}
              {preview.timeline > 0 && <div>📅 {preview.timeline} timeline days</div>}
              {preview.checklist > 0 && <div>✅ {preview.checklist} checklist items</div>}
              {preview.hasBudget && <div>💰 Budget data included</div>}
              {preview.hasAccess && <div>🔒 Access list included</div>}
              {preview.sections && <div>Sections: {preview.sections.join(', ')}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
