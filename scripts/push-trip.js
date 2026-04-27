#!/usr/bin/env node

/**
 * Push trip data to Firebase Realtime Database via REST API.
 *
 * Usage:
 *   node scripts/push-trip.js <trip-file.json> [--dry-run]
 *
 * Requires FIREBASE_DATABASE_SECRET in .env
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

// --- .env parser ---
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

// --- Helpers (mirror src/firebase.js) ---
const OWNER_EMAILS = ['mfrancese@gmail.com', 'meghancryan@gmail.com']

function sanitizeEmail(email) {
  return email.replace(/\./g, '_')
}

// --- Data transforms (mirror src/admin/ImportTool.jsx) ---
function transformData(data, isNew) {
  const result = {}

  if (data.meta) {
    result.meta = data.meta
  }

  if (data.access) {
    const accessData = {}
    for (const [email, val] of Object.entries(data.access)) {
      accessData[sanitizeEmail(email)] = val
    }
    result.access = accessData
  } else if (isNew) {
    const accessData = {}
    for (const email of OWNER_EMAILS) {
      const name = email.includes('mfrancese') ? 'Michael' : 'Meghan'
      accessData[sanitizeEmail(email)] = { role: 'owner', name }
    }
    result.access = accessData
  }

  if (data.bookings) {
    const bookingsData = {}
    data.bookings.forEach((b, i) => {
      const id = b.id || `booking_${i}`
      bookingsData[id] = { ...b, order: b.order ?? i }
      delete bookingsData[id].id
    })
    result.bookings = bookingsData
  }

  if (data.timeline) {
    const timelineData = {}
    data.timeline.forEach((d, i) => {
      const id = d.id || `day_${i}`
      timelineData[id] = { ...d, order: d.order ?? i }
      delete timelineData[id].id
    })
    result.timeline = timelineData
  }

  if (data.budget) {
    result.budget = data.budget
  }

  if (data.checklist) {
    const checkData = {}
    data.checklist.forEach((c, i) => {
      const id = c.id || `check_${i}`
      checkData[id] = { ...c, order: c.order ?? i }
      delete checkData[id].id
    })
    result.checklist = checkData
  }

  if (data.flightOptions) {
    result.flightOptions = data.flightOptions
  }

  if (data.travelers) {
    result.travelers = data.travelers
  }

  return result
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const filePath = args.find(a => !a.startsWith('--'))

  if (!filePath) {
    console.log(`
Usage: node scripts/push-trip.js <trip-file.json> [--dry-run]

  Pushes trip data to Firebase Realtime Database.
  Reads FIREBASE_DATABASE_SECRET from .env

Options:
  --dry-run   Validate and preview without writing to Firebase

Examples:
  node scripts/push-trip.js seed-atlanta.json
  node scripts/push-trip.js seed-atlanta.json --dry-run
`)
    process.exit(1)
  }

  // Load env
  const env = loadEnv()
  const databaseURL = env.VITE_FIREBASE_DATABASE_URL
  const secret = env.FIREBASE_DATABASE_SECRET

  if (!databaseURL) {
    console.error('✗ VITE_FIREBASE_DATABASE_URL not found in .env')
    process.exit(1)
  }

  if (!secret && !dryRun) {
    console.error(`✗ FIREBASE_DATABASE_SECRET not found in .env

To set it up:
  1. Go to Firebase Console → Project Settings → Service Accounts
  2. Scroll to "Database secrets" (legacy) → Show → Copy
  3. Add to .env:  FIREBASE_DATABASE_SECRET=<your-secret>
`)
    process.exit(1)
  }

  // Read and parse JSON
  let data
  const resolvedPath = resolve(process.cwd(), filePath)
  try {
    const raw = readFileSync(resolvedPath, 'utf-8')
    data = JSON.parse(raw)
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error(`✗ File not found: ${resolvedPath}`)
    } else {
      console.error(`✗ Invalid JSON: ${e.message}`)
    }
    process.exit(1)
  }

  // Validate
  if (!data.slug) {
    console.error('✗ Trip JSON must have a "slug" field')
    process.exit(1)
  }
  if (!data.meta) {
    console.error('✗ Trip JSON must have a "meta" field')
    process.exit(1)
  }

  const slug = data.slug

  // Check if trip exists
  let isNew = true
  if (!dryRun) {
    try {
      const checkRes = await fetch(`${databaseURL}/trips/${slug}/meta.json?auth=${secret}`)
      if (checkRes.ok) {
        const existing = await checkRes.json()
        isNew = !existing
      }
    } catch {
      // Assume new if can't check
    }
  }

  // Transform
  const transformed = transformData(data, isNew)
  const sections = Object.keys(transformed)

  console.log('')
  console.log(`${dryRun ? '🔍 DRY RUN — ' : ''}Pushing trip "${slug}" to Firebase...`)
  console.log(`   ${isNew ? '✨ New trip' : '⚠ Existing trip (will overwrite)'}`)
  console.log('')

  if (dryRun) {
    for (const section of sections) {
      const val = transformed[section]
      const detail = typeof val === 'object' && !Array.isArray(val)
        ? `(${Object.keys(val).length} entries)`
        : ''
      console.log(`  ✓ ${section} ${detail}`)
    }
    console.log('')
    console.log('Dry run complete. No data was written.')
    return
  }

  // Push each section
  let failures = 0
  for (const section of sections) {
    const url = `${databaseURL}/trips/${slug}/${section}.json?auth=${secret}`
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformed[section]),
      })

      if (!res.ok) {
        const errBody = await res.text()
        if (res.status === 401) {
          console.log(`  ✗ ${section} — Authentication failed. Check FIREBASE_DATABASE_SECRET in .env`)
        } else {
          console.log(`  ✗ ${section} — HTTP ${res.status}: ${errBody}`)
        }
        failures++
      } else {
        const val = transformed[section]
        const detail = typeof val === 'object' && !Array.isArray(val)
          ? `(${Object.keys(val).length} entries)`
          : ''
        console.log(`  ✓ ${section} ${detail}`)
      }
    } catch (e) {
      console.log(`  ✗ ${section} — Network error: ${e.message}`)
      failures++
    }
  }

  console.log('')
  if (failures === 0) {
    console.log(`Done! Trip "${slug}" is live at francese.family`)
  } else {
    console.log(`Finished with ${failures} error(s). Some sections may not have been written.`)
    process.exit(1)
  }
}

main()
