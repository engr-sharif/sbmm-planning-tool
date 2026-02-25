# SBMM Field Navigator — Comprehensive Improvement Plan

## Current State

`navigator.html` is a 3,786-line single-file web app: ~700 lines CSS, ~500 lines HTML, ~2,560 lines JavaScript. It works, but it's a monolith with no offline support, localStorage-only persistence (5MB limit), GitHub API for photo uploads, no security, and basic animations.

This plan transforms it into a professional-grade field tool that feels like Apple built it.

---

## Phase 1: Foundation (Week 1-2)

### 1A. Modular Code Architecture

Split the monolith into ES modules with a Vite build step that outputs a single deployable HTML file.

```
src/
  index.html                  # Shell HTML
  manifest.json               # PWA manifest
  sw.js                       # Service worker
  css/
    reset.css                 # Reset & CSS custom properties
    components.css            # Shared components (pills, chips, toggles)
    animations.css            # Spring easings, keyframes, micro-interactions
    map.css / ar.css / list.css / boring-log.css / settings.css
    lock-screen.css
  js/
    app.js                    # Entry point
    state.js                  # Reactive pub/sub store
    constants.js              # R2 points, historical data, Munsell lookup
    math.js                   # Haversine, bearing, Kalman filter
    sensors/
      gps.js                  # watchPosition + Kalman
      compass.js              # deviceorientation handlers
    views/
      map.js                  # Leaflet map, markers, layers
      ar.js                   # Canvas AR engine
      list.js                 # Point list
    features/
      boring-log.js           # Form, USCS wizard, Munsell picker
      photos.js               # Capture, compress, overlay, gallery
      arrival.js              # Detection, haptics, celebration
      settings.js             # Preferences panel
      lock-screen.js          # Passcode + credential encryption
      pdf-export.js           # Boring log PDF generation
    storage/
      local-db.js             # IndexedDB via idb library
      sync-engine.js          # Upload queue, retry, conflict resolution
      supabase-client.js      # Auth + Storage + Database
    ui/
      transitions.js          # View switching animations
      haptics.js              # Vibration patterns
      spring.js               # Spring physics utilities
```

**Key architectural change — Reactive state store:**

Replace the scattered globals (`S`, `VISITED`, `BORING_LOGS`, `PHOTOS`, `PREFS`) with a unified pub/sub store:

```javascript
// state.js — ~50 lines, no framework dependency
const store = {
  gps: { lat, lon, acc },
  compass: { hdg, beta },
  ui: { view, selectedPoint, filter },
  data: { visited, visitLog, photos, boringLogs },
  prefs: { unit, autoCenter, vibrate, autoNav }
};

// Modules subscribe: state.on('data.visited', () => { ... })
// Changes propagate automatically — no more manually calling
// drawMapMarkers() + renderList() + updateProgress() + updateCard()
```

**Build output:** `vite build --inline` produces a single `navigator.html` with everything inlined.

### 1B. IndexedDB Migration (Replace localStorage)

localStorage has a ~5-10MB limit. A single photo as a data URI can be 500KB+. IndexedDB has no practical limit (browsers allow hundreds of MB to GB) and stores Blobs natively.

```
Database: sbmm_navigator
  Stores:
    preferences     key: 'prefs'          → JSON object
    visited         key: pointId          → { timestamp, lat, lon }
    boring_logs     key: pointId          → [ interval log objects ]
    photos          key: auto-increment   → { pointId, timestamp, blob, uploaded }
                    indexes: [pointId, uploaded]
    sync_queue      key: auto-increment   → { type, payload, retries, lastAttempt }
```

Use the `idb` library (~1.2KB gzipped) for a clean Promise-based wrapper.

### 1C. Service Worker + PWA Manifest

The app claims "Works offline" but has no service worker. For a remote mine site with spotty coverage, this is critical.

**Cache strategy:**

| Resource | Strategy |
|----------|----------|
| App shell (navigator.html) | Cache-first, update in background |
| Leaflet JS/CSS (CDN) | Cache-first, long TTL |
| Esri satellite tiles | Cache-first, LRU eviction at 200MB |
| Supabase SDK (CDN) | Cache-first |
| jsPDF (CDN) | Cache-first |
| API calls | Network-first, fallback to IndexedDB |

**Tile pre-caching:** The site is ~500m × 500m. At zoom 15-21, the Esri tiles for this area can be pre-cached (~20-50MB total). Add a "Download Offline Tiles" button in Settings that fetches all tiles within the bounding box.

**Manifest:** Enables "Add to Home Screen" on iOS/Android with standalone display, portrait lock, and proper icons.

---

## Phase 2: Cloud & Security (Week 2-3)

### 2A. Supabase Integration (Replace GitHub API)

**Why Supabase over alternatives:**

| Criterion | Supabase | Firebase | Cloudflare R2 |
|-----------|----------|----------|---------------|
| Free storage | 1 GB files + 500 MB DB | 5 GB + 1 GB | 10 GB |
| Auth built-in | Yes | Yes | No |
| JS SDK from CDN | Yes | Yes | Raw S3 SDK |
| Row-Level Security | Yes (Postgres) | Yes (rules) | N/A |
| Open source | Yes | No | No |
| Egress fees | Limited free | Paid | Zero |
| Offline sync | Via PowerSync | Built-in | Manual |
| No backend needed | Yes | Yes | Needs Workers |

**Database schema (Postgres):**

```sql
CREATE TABLE boring_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id TEXT NOT NULL,
  interval_num INT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  accuracy_ft REAL,
  depth TEXT,
  uscs TEXT, uscs_desc TEXT,
  munsell_notation TEXT, munsell_name TEXT,
  moisture TEXT, density_consistency TEXT,
  pid_ppm TEXT, odor_level TEXT, odor_type TEXT,
  staining TEXT, status TEXT,
  soil_description TEXT, notes TEXT,
  device_id TEXT,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(point_id, interval_num)
);

CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION, lon DOUBLE PRECISION,
  heading REAL, accuracy_ft REAL
);
```

**Storage bucket:** `sbmm-photos/{POINT_ID}/{TIMESTAMP}.jpg`

**Auth:** Anonymous sign-in with Supabase. The app gets a JWT for RLS policies. No individual accounts needed — the passcode lock (2B) gates access.

### 2B. Lock Screen with Passcode

**Design — iOS-style passcode entry:**

```
┌──────────────────────────────┐
│                              │
│     🧭 SBMM Field Navigator │
│          v3.1                │
│                              │
│       ● ● ● ○ ○ ○           │
│                              │
│    ┌─────┐ ┌─────┐ ┌─────┐  │
│    │  1  │ │  2  │ │  3  │  │
│    └─────┘ └─────┘ └─────┘  │
│    ┌─────┐ ┌─────┐ ┌─────┐  │
│    │  4  │ │  5  │ │  6  │  │
│    └─────┘ └─────┘ └─────┘  │
│    ┌─────┐ ┌─────┐ ┌─────┐  │
│    │  7  │ │  8  │ │  9  │  │
│    └─────┘ └─────┘ └─────┘  │
│            ┌─────┐ ┌─────┐  │
│            │  0  │ │  ⌫  │  │
│            └─────┘ └─────┘  │
│                              │
│       Skip (read-only)       │
└──────────────────────────────┘
```

**Secure credential storage via Web Crypto API:**

1. First-time setup (project lead enters passcode + Supabase credentials)
2. Derive AES-256-GCM key from passcode via PBKDF2 (100K iterations, SHA-256)
3. Encrypt credentials → store ciphertext + salt + IV in IndexedDB
4. On subsequent launches: enter passcode → derive key → decrypt → init Supabase
5. Passcode itself is never stored — only a salted verification hash

This means:
- API keys are encrypted at rest — not plaintext in localStorage
- Any team member who knows the code can use the app
- If the device is lost, credentials are protected by the passcode
- No individual account setup needed

### 2C. Sync Engine

```
User Action → [Write to IndexedDB] → [Add to sync_queue] → [Sync Daemon]
                   (instant)              (instant)             ↓
                                                         Online? → Drain queue → Supabase
                                                         Offline? → Show badge, retry on connect
```

**UI indicator** (next to GPS pill in top bar):
- ☁️ Green = all synced
- ☁️ Orange + count = uploads pending
- ☁️ Red = sync failed (tap to retry)

**Conflict resolution:** Last-write-wins with timestamps. Field teams rarely edit the same point simultaneously.

---

## Phase 3: UX Polish — Apple-Level Design (Week 3-4)

### 3A. Spring Physics Animations

Replace all `cubic-bezier(0.4,0,0.2,1)` (Material Design) with CSS `linear()` spring curves:

```css
:root {
  /* Snappy: stiffness 400, damping 30 — for tab indicator, chip selection */
  --spring-snappy: linear(0, 0.006, 0.025, 0.058, ... 1.0);
  /* Bouncy: stiffness 200, damping 15 — for cards, sheets, modals */
  --spring-bouncy: linear(0, 0.004, ... 1.052, ... 0.998, 1.0);
  /* Gentle: stiffness 120, damping 20 — for view transitions */
  --spring-gentle: linear(0, 0.003, ... 1.0);
}
```

**Specific replacements:**

| Element | Before | After |
|---------|--------|-------|
| Point card slide-up | `cubic-bezier .35s` | Spring bouncy 0.5s with 15% overshoot |
| Boring log sheet | `cubic-bezier .35s` | Spring bouncy 0.5s |
| Tab indicator | `cubic-bezier .25s` | Spring snappy 0.4s, width stretches mid-flight |
| Layer panel | `transform .2s, opacity .2s` | Spring snappy with elastic feel |
| FAB press | `scale(0.9)` | Spring scale-down-and-back |
| Arrival flash | `ease .3s` | Scale spring with confetti particles |
| Filter chips | Instant color swap | Scale to 0.95 → spring back with fill animation |

### 3B. Haptic Feedback System

Currently only used for arrival. Expand to every meaningful interaction:

| Interaction | Pattern |
|-------------|---------|
| Tab switch | `vibrate(10)` — light tick |
| Chip selection | `vibrate(8)` — soft tap |
| Point selected on map | `vibrate(15)` — medium tap |
| Boring log saved | `vibrate([15, 50, 15])` — success |
| GPS lock achieved (≤3 ft) | `vibrate([10, 30, 10])` — double tick |
| Error / validation fail | `vibrate([30, 50, 30])` — heavy buzz |
| Lock screen digit entry | `vibrate(5)` — keyclick |
| Lock screen unlock | `vibrate([8, 40, 8, 40, 15])` — smooth cascade |
| Arrival at point | Current pattern (good) |

### 3C. Micro-interactions

1. **Tab bar morphing indicator** — blob that stretches during transition (rubber-band effect), not just a sliding line
2. **List row swipe actions** — swipe right → navigate, swipe left → log sample, with spring snap-back
3. **Point card drag-to-dismiss** — follow finger pan, spring back or dismiss based on velocity
4. **Boring log half-sheet** — opens at 60% height, drag handle to expand/collapse
5. **GPS accuracy counter** — animated number rollup when accuracy changes, pulse animation on GPS lock
6. **Arrival celebration** — confetti canvas particles + SVG checkmark path animation
7. **Photo capture** — captured image thumbnail flies/shrinks into photo badge (like iOS screenshot)
8. **Empty states** — illustrated placeholders when no points match filter
9. **Skeleton loading** — shimmer rows during list render
10. **Pull-to-refresh** — natural overscroll with spring indicator on list view

### 3D. View Transitions

Replace hard show/hide with animated transitions:
- **Map → List:** List slides up from bottom with spring
- **List → Map:** List slides down
- **Any → AR:** Crossfade with camera feed
- **Settings:** Slide up from bottom (current, but with spring)

### 3E. Light Mode for Field Use

Dark mode is hard to read in direct sunlight. Add system-preference-matching light mode:

```css
@media (prefers-color-scheme: light) {
  :root {
    --bg: #f8fafc; --surface: #ffffff; --surface2: #f1f5f9;
    --text: #0f172a; --text2: #475569; --text3: #94a3b8;
    --border: #e2e8f0;
  }
}
```

Plus a manual toggle in Settings (Auto / Light / Dark).

### 3F. Accessibility

- `prefers-reduced-motion` media query to disable spring animations
- ARIA labels on all icon-only buttons (FABs, close buttons)
- Minimum 44×44px touch targets (most already comply)
- Color never as sole indicator — always paired with icons/text

---

## Phase 4: Features (Week 4-5)

### 4A. Boring Log PDF Export (ASTM D2488 Format)

Generate professional boring log PDFs directly in the browser using **jsPDF + jsPDF-AutoTable**.

**Standard boring log layout:**

```
┌─────────────────────────────────────────────────────┐
│ PROJECT: SBMM OU1 ABP Pre-Design    BORING: W01    │
│ DATE: 02/25/2026    DRILLER: ___    SHEET: 1 of 1  │
│ GPS: 39.006016, -122.669805 (±2.1 ft)              │
│ METHOD: Hand Auger / Grab Sample    ELEV: ___      │
├──────┬────────┬──────┬──────────────────┬─────┬─────┤
│Depth │ Sample │ USCS │ Description      │ PID │Notes│
│ (ft) │   No.  │      │                  │(ppm)│     │
├──────┼────────┼──────┼──────────────────┼─────┼─────┤
│      │        │      │                  │     │     │
│ 0    │ 1 of 2 │  SM  │ Medium dense,    │ 2.3 │None │
│      │        │      │ dark brown       │     │     │
│ 0.5  │        │      │ (10YR 3/2),      │     │     │
│      │        │      │ Silty SAND, moist│     │     │
├──────┼────────┼──────┼──────────────────┼─────┼─────┤
│      │        │      │                  │     │     │
│ 0.5  │ 2 of 2 │  CL  │ Stiff, grayish   │ 0.8 │Stain│
│      │        │      │ brown (2.5Y 5/2),│     │slight│
│ 1.0  │        │      │ Clay (LP), wet   │     │     │
├──────┴────────┴──────┴──────────────────┴─────┴─────┤
│ [Photo thumbnails]                                   │
│ LEGEND: SM=Silty Sand, CL=Clay (Low Plasticity)     │
│ Log prepared using SBMM Field Navigator v3.1         │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Graphical hatch patterns for USCS soil types (dots = sand, dashes = silt, bricks = clay)
- Munsell color swatch in the description column
- Photo thumbnails at bottom from the photo gallery
- "Export Single" button on each boring log sheet
- "Export All" button in Settings → generates combined PDF of all logged points
- Professional header with project info, GPS coords, accuracy

All data needed is already collected in the `BORING_LOGS` data structure.

### 4B. Enhanced CSV Export

In addition to the existing CSV, add:
- Summary CSV with one row per point (aggregating intervals)
- Photo manifest CSV (point, timestamp, GPS, storage URL)
- GIS-ready export (GeoJSON with boring log data as properties)

### 4C. Multi-Project Support (Future)

Structure the database for future sites beyond SBMM:
- Projects table with site name, point data, config
- Switch between projects in Settings
- Import point data from CSV instead of hardcoding

---

## Technology Stack Summary

| Need | Solution | Size |
|------|----------|------|
| Local storage | IndexedDB via `idb` | ~1.2KB |
| Cloud backend | Supabase (auth + Postgres + Storage) | CDN SDK ~45KB |
| Photo storage | Supabase Storage + IndexedDB blobs | — |
| PDF generation | jsPDF + jsPDF-AutoTable | ~50KB |
| Spring animations | CSS `linear()` function | 0KB (native CSS) |
| Offline caching | Service worker (Workbox) | ~5KB |
| Build tool | Vite (dev only) | — |
| Credential encryption | Web Crypto API (PBKDF2 + AES-GCM) | 0KB (native) |
| State management | Custom pub/sub (~50 lines) | ~0.5KB |

**Total added bundle size:** ~100KB gzipped (mostly Supabase SDK + jsPDF)

---

## Implementation Priority

```
Phase 1 ─── Foundation ─────────────────────────────────
  1. IndexedDB migration (unblocks photo storage NOW)
  2. Module split + Vite build setup
  3. Service worker + PWA manifest

Phase 2 ─── Cloud & Security ───────────────────────────
  4. Lock screen + passcode + credential encryption
  5. Supabase integration (auth, database, storage)
  6. Sync engine (background upload queue)

Phase 3 ─── UX Polish ─────────────────────────────────
  7. Spring animations (CSS linear() curves)
  8. Haptic feedback system
  9. View transitions + micro-interactions
  10. Light mode + accessibility

Phase 4 ─── Features ──────────────────────────────────
  11. Boring log PDF export (jsPDF, ASTM D2488 format)
  12. Tile pre-caching for true offline maps
  13. Enhanced exports (GeoJSON, photo manifest)
```
