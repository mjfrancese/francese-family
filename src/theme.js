export const colors = {
  bg: '#0d0d18',
  bgGradient: 'linear-gradient(180deg, #0e0e1e 0%, #0d0d18 100%)',
  card: '#141420',
  cardHover: '#181830',
  cardBorder: '#1e1e30',
  cardBorderActive: '#2a2a4a',
  text: '#e8e4df',
  textMuted: '#c8c4bf',
  textDim: '#8a8aaa',
  textDark: '#6a6a8a',
  accent: '#4a90d9',
  divider: '#1a1a2a',
  border: '#2a2a3a',

  status: {
    booked: { bg: '#1a3a2a', border: '#2d6b45', color: '#5ce892', icon: '✓' },
    pending: { bg: '#3a2e1a', border: '#6b5a2d', color: '#e8c55c', icon: '⏳' },
    missing: { bg: '#3a1a1a', border: '#6b2d2d', color: '#e85c5c', icon: '!' },
    action: { bg: '#3a2e1a', border: '#6b5a2d', color: '#e8c55c', icon: '⚑' },
    confirmed: { bg: '#1a3a2a', border: '#2d6b45', color: '#5ce892', icon: '✓' },
  },

  bullet: {
    info: '#4a90d9',
    warn: '#e8c55c',
    tip: '#5ce892',
    default: '#8a8aaa',
  },

  checklist: {
    urgent: '#fbbf24',
    done: '#5ce892',
    progress: '#34d399',
  },

  groups: {
    'this-week': { bg: '#2a1a1a', border: '#4a2a2a', label: '#e85c5c', title: 'Do This Week' },
    'april': { bg: '#2a2a1a', border: '#4a4a2a', label: '#e8c55c', title: 'Before Travel — April' },
    'may': { bg: '#2a1a2a', border: '#4a2a4a', label: '#b88ad9', title: 'Before Travel — May' },
    'june': { bg: '#1a1a2a', border: '#2a2a4a', label: '#4a90d9', title: 'Before Travel — June' },
    'packing': { bg: '#1a2a2a', border: '#2a4a4a', label: '#8a8aaa', title: 'Packing & Prep' },
    'urgent': { bg: '#2a1a1a', border: '#4a2a2a', label: '#e85c5c', title: 'Urgent' },
    'normal': { bg: '#1a1a2a', border: '#2a2a4a', label: '#8a8aaa', title: 'To Do' },
    'completed': { bg: '#1a2a1a', border: '#2a4a2a', label: '#5ce892', title: 'Completed' },
  },
}

export const fonts = {
  heading: "'Playfair Display', serif",
  body: "'DM Sans', sans-serif",
  mono: "monospace",
}

export const styles = {
  page: {
    minHeight: '100vh',
    background: colors.bg,
    fontFamily: fonts.body,
    color: colors.text,
  },
  card: {
    background: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 8,
    padding: 16,
  },
  heading: {
    fontFamily: fonts.heading,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  tabBar: {
    display: 'flex',
    gap: 0,
    borderBottom: `1px solid ${colors.divider}`,
    marginBottom: 20,
    overflowX: 'auto',
  },
  tab: (active) => ({
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${colors.accent}` : '2px solid transparent',
    color: active ? colors.text : colors.textDim,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  }),
}
