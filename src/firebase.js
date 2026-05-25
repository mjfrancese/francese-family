import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export const googleProvider = new GoogleAuthProvider()

setPersistence(auth, browserLocalPersistence)

export function sanitizeEmail(email) {
  return email.replace(/\./g, '_')
}

// All recognized family emails
export const OWNER_EMAILS = ['mfrancese@gmail.com', 'meghancryan@gmail.com', 'megc.holland@gmail.com', 'meghan@saint-tims.org']
export const MICHAEL_EMAILS = ['mfrancese@gmail.com']
export const MEGHAN_EMAILS = ['meghancryan@gmail.com', 'megc.holland@gmail.com', 'meghan@saint-tims.org']
export const KENNA_EMAILS = ['kennarholland@gmail.com']

export function isOwnerEmail(email) {
  return OWNER_EMAILS.includes(email)
}

export function getPersonFromEmail(email) {
  if (MICHAEL_EMAILS.includes(email)) return 'michael'
  if (MEGHAN_EMAILS.includes(email)) return 'meghan'
  if (KENNA_EMAILS.includes(email)) return 'kenna'
  return null
}

// Route each person to their home view after login
export function getHomeRouteForEmail(email) {
  const person = getPersonFromEmail(email)
  if (person === 'michael') return '/dashboard'
  if (person === 'meghan') return '/home'
  if (person === 'kenna') return '/kenna'
  return '/'
}

// Per-person brand colors — used across all views
export const PERSON_COLORS = {
  michael: '#4a90d9',   // blue
  meghan:  '#a78bfa',   // purple
  kenna:   '#fbbf24',   // amber
  louise:  '#f472b6',   // pink
}
