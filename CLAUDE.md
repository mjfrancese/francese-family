# Francese Family Travel Dashboard

## Project Overview
React/Vite family travel planning app backed by Firebase Realtime Database. Deployed to francese.family via GitHub Pages.

## Tech Stack
- React 18 + Vite 5, inline CSS with custom dark theme (`src/theme.js`)
- Firebase Realtime Database for trip data, auth, and access control
- Lucide React for icons (no emojis)
- Python flight search API (`server/app.py`) wrapping the `fli` library (Google Flights data)

## Development
- `npm run dev` — Vite dev server (proxies `/api` to Python backend on port 4001)
- `npm run api` — Start the flight search API server
- `npm run build` — Production build
- Trip seed data lives in `seed-*.json` files; push to Firebase via `npm run push-trip`

## Deployment — Two-Step Process (IMPORTANT)

The live site has **two independent layers** that must both be updated:

### 1. Firebase Data (trip content)
All trip content (itinerary, checklist, budget, bookings, warnings, tips) is stored in **Firebase Realtime Database** and loaded at runtime. The `seed-*.json` files are the source of truth for trip data. The root-level `*.jsx` files (e.g., `london-paris-disney.jsx`) are **standalone component templates** that mirror the seed data but are NOT imported by the Vite build.

**To update trip content on the live site:**
```bash
npm run push-trip seed-london-paris.json   # pushes to Firebase
```
This is what actually changes what users see. Without this step, editing seed JSON or the root JSX files has **zero effect** on the live site.

### 2. GitHub Pages (React app code)
The React app in `src/` is built by Vite and deployed via GitHub Actions on push to `main`. This handles the **UI shell, components, routing, and auth** — but NOT the trip data content.

**To update the app code:**
```bash
git push origin main   # triggers GitHub Actions → builds → deploys to GitHub Pages
```

### Summary: What to do when updating trip info
1. Edit `seed-*.json` (and optionally the root `*.jsx` template to keep them in sync)
2. Run `npm run push-trip seed-<trip>.json` to push data to Firebase
3. Commit and push to `main` if any source code in `src/` changed
4. The root `*.jsx` files are reference/templates only — they do not affect the live site directly

## Family Context
- **Travelers**: Michael, Meghan, Louise (toddler), sometimes Kenna (Meghan's daughter)
- **Home airport**: STL (St. Louis)
- Michael's parents live in Melvin Village, NH (lake house)
- Michael's sister Kristina and her family may overlap on NH visits

## Rental Car Loyalty Status
- **Hertz**: President's Circle
- **Avis**: President's Club
- **National**: Executive Elite
- **Enterprise**: Platinum

These statuses provide upgrades, skip-the-counter service, and preferred pricing. Prefer National or Hertz for best elite benefits when recommending rental cars.
