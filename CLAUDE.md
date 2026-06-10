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

## Time-aware trips (the "trip clock")
The Day-by-Day tab is timezone-aware: it auto-surfaces the current day at the
top (a "You are here" banner with the now/next event + today's warnings),
collapses finished days behind a fold, and highlights today. Engine lives in
`src/utils/tripClock.js` (pure, dependency-free, `Intl`-based); UI in
`src/components/NowBanner.jsx`; wired through `src/trip/DayByDay.jsx`.

To make ANY trip time-aware, add two fields to each timeline day in its seed:
- `"date": "YYYY-MM-DD"` — the absolute calendar date of that day
- `"tz": "America/New_York"` — IANA timezone (e.g. NH/FL = `America/New_York`)

Single-timezone trips just need the same `tz` on every day. For travel days
that cross zones, add a per-event `"tz"` override on individual events (see
`seed-london-paris.json` Jun 13/16 for the pattern). Trips WITHOUT `date`/`tz`
render normally (the feature self-disables). Preview any moment with the
`?now=YYYY-MM-DDTHH:MM` URL param (treated as wall-clock in each day's zone).

## Build-Your-Own days (adaptive, shared, sticky plans)
Any timeline day can carry a `plan` that turns it into an interactive
"choose at each step" day. Tapping an option reveals ITS OWN travel + notes,
so the plan reshapes as you pick. Options are **multi-select**: pick two+ in a
slot and the group "splits" — each chosen option grows per-traveler **"who?"**
chips (progressive disclosure — the who-UI only appears once you split). The
traveler presets come from `meta.travelers`. Selections are stored in Firebase
at `trips/{slug}/selections/{dayId}/{slotId}/{optionId}` = `true` (whole group)
or `{ travelerId: true }` (assigned), read with `onValue`, so they **sync
across all viewers** (like checklist toggles), **stick**, and toggle on/off.
Fixed/booked items are `fixed: true` slots, rendered in line at their time with
no options. Engine: `src/hooks/useSelections.js` + `src/utils/selectionUtils.js`
+ `src/components/DayPlan.jsx`, wired through DayCard/DayByDay/TripDashboard.

Schema on a day:
```
"plan": {
  "intro": "...",
  "slots": [{
    "id": "morning", "title": "Morning — pick your vibe", "time": "~10:30",
    "options": [{
      "id": "magic", "label": "Street magic", "icon": "🎩",
      "for": "Everyone", "tier": "gem",        // tier:gem = 🦢 whole-family highlight
      "summary": "...", "cost": "Free", "book": "Pre-book (url)",
      "travel": "Piccadilly line ...",          // adaptive: shown when chosen
      "notes": [{ "type": "tip|warn|info", "text": "..." }],
      "then": "You're a 5-min walk from ..."
    }]
  }]
}
```
Keep fixed bookings (Matilda, NHM) as normal `events` (anchors); put the
choices in `plan`. Reusable for every trip — NH/FL can use it too.

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
