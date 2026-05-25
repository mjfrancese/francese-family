#!/usr/bin/env node
/**
 * push-ops-data.js
 *
 * Seeds /loops, /sequences, and /family-status into Firebase.
 * Run: node scripts/push-ops-data.js [--dry-run]
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

function loadEnv() {
  try {
    const envPath = resolve(PROJECT_ROOT, '.env')
    const envFile = readFileSync(envPath, 'utf-8')
    const env = {}
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
    }
    return env
  } catch {
    return {}
  }
}

async function firebasePut(dbUrl, secret, path, value) {
  const url = `${dbUrl}/${path}.json?auth=${secret}`
  if (DRY_RUN) {
    console.log(`[DRY RUN] PUT ${path}:`, JSON.stringify(value, null, 2).slice(0, 200))
    return
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUT ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

const env = loadEnv()
const DB_URL = env.VITE_FIREBASE_DATABASE_URL
const DB_SECRET = env.FIREBASE_DATABASE_SECRET

if (!DB_URL || !DB_SECRET) {
  console.error('Missing VITE_FIREBASE_DATABASE_URL or FIREBASE_DATABASE_SECRET in .env')
  process.exit(1)
}

// ── OPEN LOOPS ─────────────────────────────────────────────────────────────
// Each loop: a single external dependency that can be done in one session.
// status: open | waiting | done
// owner: michael | meghan | both
// urgency: high | medium | low  (drives color on board)
const loops = {
  'disney-room-link': {
    title: 'Call Disney to link Art of Marvel bookings to same room',
    detail: 'Bookings 32984124 and H-DKH4WQD368V2 need to be linked.',
    blocked_on: 'Disney phone call — cast member required',
    due: '2026-06-01',
    owner: 'michael',
    sequence_id: 'london-prep',
    status: 'open',
    urgency: 'high',
    business_hours_only: true,
    est_minutes: 15,
  },
  'uk-etas': {
    title: 'Submit UK ETAs for all 4 family members',
    detail: 'Michael, Meghan, Kenna, Louise — gov.uk/apply-standard-visitor-visa',
    blocked_on: 'Michael action — gov.uk website, ~20 min',
    due: '2026-06-05',
    owner: 'michael',
    sequence_id: 'london-prep',
    status: 'open',
    urgency: 'high',
    business_hours_only: false,
    est_minutes: 20,
  },
  'travelodge-confirm': {
    title: 'Get Travelodge confirmation number',
    detail: 'Booking exists but confirmation number not saved.',
    blocked_on: 'Check Travelodge email or account',
    due: '2026-06-07',
    owner: 'michael',
    sequence_id: 'london-prep',
    status: 'open',
    urgency: 'high',
    business_hours_only: false,
    est_minutes: 10,
  },
  'eurostar-kids': {
    title: 'Add Kenna and Louise passenger info to Eurostar booking',
    detail: 'Ref QRXPZK — children not yet added.',
    blocked_on: 'Eurostar website — ref QRXPZK',
    due: '2026-06-07',
    owner: 'michael',
    sequence_id: 'london-prep',
    status: 'open',
    urgency: 'medium',
    business_hours_only: false,
    est_minutes: 15,
  },
  'dr-nagam-rheum': {
    title: 'Schedule rheumatology with Dr. Nagam',
    detail: 'APS travel letter + prophylactic anticoag for transatlantic flights before London.',
    blocked_on: 'Phone call to Dr. Nagam office — business hours',
    due: '2026-06-01',
    owner: 'meghan',
    sequence_id: 'wegovy-appeal',
    status: 'open',
    urgency: 'high',
    business_hours_only: true,
    est_minutes: 10,
  },
  'hyundai-goodwill': {
    title: 'Follow up on Hyundai goodwill case #42509324',
    detail: 'P049D00 / TSB 25-01-023H / Campaign 9B3. Campaign 9B4 BMS update also due.',
    blocked_on: 'Waiting on Hyundai case response',
    due: null,
    owner: 'michael',
    sequence_id: null,
    status: 'waiting',
    urgency: 'medium',
    business_hours_only: false,
    est_minutes: null,
  },
  'mo-parking-placard': {
    title: 'MO disabled parking placard — waiting on mail delivery',
    detail: 'Forms 1776 + 2769 completed by Dr. Senol. Qualifying doc for DLP Priority Card.',
    blocked_on: 'MO DMV mail delivery',
    due: '2026-06-07',
    owner: 'meghan',
    sequence_id: null,
    status: 'waiting',
    urgency: 'medium',
    business_hours_only: false,
    est_minutes: null,
  },
  'uscis-genealogy': {
    title: 'USCIS genealogy index search result — follow up',
    detail: 'G-1041 submitted. Tracking Luca Francesi records.',
    blocked_on: 'USCIS processing',
    due: null,
    owner: 'michael',
    sequence_id: 'italian-citizenship',
    status: 'waiting',
    urgency: 'low',
    business_hours_only: false,
    est_minutes: null,
  },
  'familysearch-app': {
    title: 'FamilySearch developer app — Ticket #2618686',
    detail: 'Pending approval for API access to Italian records.',
    blocked_on: 'FamilySearch review queue',
    due: null,
    owner: 'michael',
    sequence_id: 'italian-citizenship',
    status: 'waiting',
    urgency: 'low',
    business_hours_only: false,
    est_minutes: null,
  },
}

// ── SEQUENCES ──────────────────────────────────────────────────────────────
// Ordered multi-step processes. current_step is 0-indexed.
const sequences = {
  'london-prep': {
    title: 'London + Paris Trip Prep',
    owner: 'michael',
    color: '#4a90d9',
    due: '2026-06-07',
    steps: [
      { label: 'Core bookings confirmed (BA, Eurostar, hotels, Matilda, HEX)', status: 'done', completed: '2026-05-01' },
      { label: 'UK ETAs submitted for all 4', status: 'open' },
      { label: 'Travelodge confirmation number saved', status: 'open' },
      { label: 'Eurostar: Kenna + Louise passenger info added', status: 'open' },
      { label: 'Disney Art of Marvel bookings linked to same room', status: 'open' },
      { label: 'MO parking placard received (DLP Priority Card)', status: 'waiting' },
    ],
  },
  'wegovy-appeal': {
    title: 'Wegovy / Semaglutide Coverage Appeal',
    owner: 'michael',
    color: '#e8c55c',
    due: null,
    steps: [
      { label: 'Dr. Senol referral to orthopedist (knee OA)', status: 'done', completed: '2026-05-01' },
      { label: 'Orthopedist appointment', status: 'in-progress' },
      { label: 'OA diagnosis formally documented', status: 'pending' },
      { label: 'Submit Anthem BCBS appeal with OA documentation', status: 'pending' },
      { label: 'NovoCare self-pay running in parallel (fallback)', status: 'in-progress' },
    ],
  },
  'italian-citizenship': {
    title: 'Italian Citizenship by Descent (Jure Sanguinis)',
    owner: 'michael',
    color: '#5ce892',
    due: null,
    steps: [
      { label: 'Line confirmed: Luca Francesi → Eugene → Richard → Michael → Louise', status: 'done', completed: '2025-01-01' },
      { label: 'USCIS G-1041 genealogy index search submitted', status: 'waiting' },
      { label: 'FamilySearch developer app approved (Ticket #2618686)', status: 'waiting' },
      { label: 'Comune di Tramonti records obtained', status: 'pending' },
      { label: 'Chicago consulate appointment (Dad-first via Law 74/2025)', status: 'pending' },
    ],
  },
  'vehicle-maintenance': {
    title: 'Vehicle Catch-Up (Tucson + RAV4)',
    owner: 'michael',
    color: '#b88ad9',
    due: null,
    steps: [
      { label: 'Hyundai goodwill case #42509324 resolved (P049D00 / TSB 25-01-023H)', status: 'waiting' },
      { label: 'Campaign 9B3 + 9B4 (BMS update) completed at Cintech Automotive', status: 'pending' },
      { label: 'RAV4 maintenance current', status: 'pending' },
    ],
  },
}

// ── FAMILY STATUS ──────────────────────────────────────────────────────────
const familyStatus = {
  overall: 'needs-attention',  // on-track | needs-attention | action-required
  updated: new Date().toISOString(),
  areas: {
    london_trip: {
      status: 'action-required',
      label: 'London + Paris',
      message: '4 items open before June 7. Disney call + UK ETAs are highest priority.',
    },
    wegovy: {
      status: 'needs-attention',
      label: 'Meghan Wegovy',
      message: 'Orthopedist step in progress. Dr. Nagam rheum call still needed before London.',
    },
    vehicles: {
      status: 'needs-attention',
      label: 'Vehicles',
      message: 'Hyundai goodwill case waiting. Dealer visit for 9B4 still needed.',
    },
    citizenship: {
      status: 'on-track',
      label: 'Italian Citizenship',
      message: 'USCIS and FamilySearch submissions pending — no action needed yet.',
    },
  },
}

// ── PUSH ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN ? '[DRY RUN MODE]' : '[LIVE MODE]')
  console.log(`DB: ${DB_URL}`)
  console.log()

  console.log('Pushing /loops ...')
  await firebasePut(DB_URL, DB_SECRET, 'loops', loops)
  console.log(`  ${Object.keys(loops).length} loops written`)

  console.log('Pushing /sequences ...')
  await firebasePut(DB_URL, DB_SECRET, 'sequences', sequences)
  console.log(`  ${Object.keys(sequences).length} sequences written`)

  console.log('Pushing /family-status ...')
  await firebasePut(DB_URL, DB_SECRET, 'family-status', familyStatus)
  console.log('  family-status written')

  console.log()
  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })
