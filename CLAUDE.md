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
